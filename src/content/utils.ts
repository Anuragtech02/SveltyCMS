/**
 * @file src/content/utils.ts
 * @description Helper functions for Content
 *
 * Structure:
 * - constructNestedStructure: Converts a flat list of content nodes into a nested structure
 * - constructContentPaths: Converts a nested structure into a flat list of content nodes
 * - generateCategoryNodesFromPaths: Extracts category nodes from a flat list of content nodes
 *
 * Module Processing:
 * - processModule: Extracts schema from module content
 *
 * Widget Utilities:
 * - ensureWidgetsInitialized: Initializes widgets
 * - resolveWidgetPlaceholder: Resolves a widget placeholder
 */

import widgetProxy, { ensureWidgetsInitialized, resolveWidgetPlaceholder } from '@src/widgets';
import { logger } from '../utils/logger.svelte';
import type { ContentNode, MinimalContentNode, Schema } from './types';

// An extended version of ContentNode for UI purposes that includes children.
export interface ExtendedContentNode extends ContentNode {
	path?: string;
	children?: ExtendedContentNode[];
}

export function constructNestedStructure(contentStructure: ContentNode[]): ExtendedContentNode[] {
	const nodeMap = new Map<string, ExtendedContentNode>();
	const byParent: Record<string, ExtendedContentNode[]> = {};
	const ROOT_KEY = '__root__';

	// Step 1: Convert to ExtendedContentNode and group by parentId
	for (const node of contentStructure) {
		const nested: ExtendedContentNode = { ...node, path: '', children: [] };
		nodeMap.set(node._id, nested);
		const parentKey = node.parentId ?? ROOT_KEY;
		if (!byParent[parentKey]) byParent[parentKey] = [];
		byParent[parentKey].push(nested);
	}

	const result: ExtendedContentNode[] = [];
	const rootNodes = byParent[ROOT_KEY] ?? [];

	// Step 2: DFS using a stack to build the tree
	const stack: { node: ExtendedContentNode; parentPath: string }[] = [];
	for (const root of rootNodes) {
		root.path = `/${root.name}`;
		result.push(root);
		stack.push({ node: root, parentPath: '' });
	}

	while (stack.length > 0) {
		const { node } = stack.pop()!;
		const children = byParent[node._id] ?? [];
		for (let i = children.length - 1; i >= 0; i--) {
			const child = children[i];
			child.path = `${node.path}/${child.name}`;
			node.children!.push(child);
			stack.push({ node: child, parentPath: node.path ?? '' });
		}
	}
	return result;
}

export function generateCategoryNodesFromPaths(files: Schema[]): Map<string, MinimalContentNode> {
	const folders = new Map<string, MinimalContentNode>();

	for (const file of files) {
		if (!file.path) continue;
		const parts = file.path.split('/').filter(Boolean);
		let path = '';
		for (let i = 0; i < parts.length - 1; i++) {
			const name = parts[i];
			path = `${path}/${name}`;
			if (!folders.has(path)) {
				folders.set(path, { name, path, nodeType: 'category' });
			}
		}
	}

	return folders;
}

export function constructContentPaths(contentStructure: ContentNode[]): Record<string, ContentNode> {
	const byParent: Record<string, ContentNode[]> = {};
	const result: Record<string, ContentNode> = {};

	for (const node of contentStructure) {
		const parentKey = node.parentId ?? '__root__';
		if (!byParent[parentKey]) byParent[parentKey] = [];
		byParent[parentKey].push(node);
	}

	const stack: { node: ContentNode; path: string }[] = [];
	const rootNodes = byParent['__root__'] ?? [];
	for (const root of rootNodes) {
		stack.push({ node: root, path: `/${root.name}` });
	}

	while (stack.length > 0) {
		const { node, path } = stack.pop()!;
		result[path] = { ...node };

		const children = byParent[node._id] ?? [];
		for (let i = children.length - 1; i >= 0; i--) {
			const child = children[i];
			stack.push({ node: child, path: `${path}/${child.name}` });
		}
	}

	return result;
}

export async function processModule(content: string): Promise<{ schema?: Schema } | null> {
	try {
		await ensureWidgetsInitialized();

		const uuidMatch = content.match(/\/\/\s*UUID:\s*([a-f0-9-]{32})/i);
		const uuid = uuidMatch ? uuidMatch[1] : null;

		if (!uuid) {
			logger.warn('No UUID found in module content');
			return null;
		}

		// Extract the schema export by finding the opening brace and matching it
		const exportMatch = content.match(/export\s+const\s+schema\s*=\s*/);
		if (!exportMatch) {
			logger.warn('No schema export found in module');
			return null;
		}

		const startIdx = exportMatch.index! + exportMatch[0].length;
		let braceCount = 0;
		let inString = false;
		let stringChar = '';
		let endIdx = startIdx;

		// Parse through the content to find the matching closing brace
		for (let i = startIdx; i < content.length; i++) {
			const char = content[i];
			const prevChar = i > 0 ? content[i - 1] : '';

			// Handle string literals
			if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
				if (!inString) {
					inString = true;
					stringChar = char;
				} else if (char === stringChar) {
					inString = false;
					stringChar = '';
				}
			}

			if (!inString) {
				if (char === '{') braceCount++;
				if (char === '}') braceCount--;

				if (braceCount === 0 && char === '}') {
					endIdx = i + 1;
					break;
				}
			}
		}

		const schemaContent = content.substring(startIdx, endIdx);
		if (!schemaContent || schemaContent.trim() === '') {
			logger.warn('Could not extract schema content');
			return null;
		}

		// Create a simple evaluation context with widgets available
		const moduleContent = `
			return (function() {
				const widgets = globalThis.widgets;
				const schema = ${schemaContent};
				return schema;
			})();
		`;

		// Set widgets on globalThis temporarily
		if (typeof globalThis !== 'undefined') {
			(globalThis as any).widgets = widgetProxy;
		}

		// Create and execute the function
		const moduleFunc = new Function(moduleContent);
		const result = moduleFunc();

		// Clean up
		if (typeof globalThis !== 'undefined') {
			delete (globalThis as any).widgets;
		}

		if (result && typeof result === 'object' && 'fields' in result) {
			logger.trace(`Successfully processed collection with UUID: \x1b[33m${uuid}\x1b[0m`);
			return { schema: { ...result, _id: uuid } as Schema };
		}

		logger.warn(`Module processed but no fields found. Result type: ${typeof result}`);
		return null;
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : String(err);
		logger.error('Failed to process module:', { error: errorMessage, stack: err instanceof Error ? err.stack : undefined });
		return null;
	}
}
