---
title: SveltyCMS Documentation
description: Complete documentation for SveltyCMS - a powerful, modern Headless CMS built with SvelteKit and Svelte 5. Designed for both users and developers.
type: user
icon: mdi:book-open-variant
folder: 01-getting-started
order: 10
created: 2025-08-05
updated: 2025-08-05
---

# SveltyCMS Documentation

Welcome to SveltyCMS - a powerful, modern Headless CMS built with SvelteKit and Svelte 5. Our documentation is designed with two clear goals:

## 🎯 Documentation Goals

### 👥 **For Users**: Understand Every Feature + Feel Confident About Security

- Complete feature guides with security confidence
- Built-in safety features explained
- Best practices for secure content management

### 🛠️ **For Developers**: Understand How SveltyCMS Works

- Deep dive into architecture and systems
- Implementation patterns and best practices
- Extension and customization guides

## 📚 Choose Your Path

### 👥 [User Guide](./User_Guide/README.md) - **Features & Security Confidence**

Perfect for content creators, editors, and administrators who need to:

- ✅ **Use Features Safely** - Complete guides with security best practices
- ✅ **Manage Content** - Create, edit, and publish with confidence
- ✅ **Understand Security** - Built-in protection features explained
- ✅ **Troubleshoot Issues** - Safe solutions to common problems

**Key Security Highlights:**

- 🛡️ Enterprise-grade authentication (JWT + OAuth)
- 🔐 Role-based permissions and access control
- 🔒 Encrypted data storage and transmission
- 📊 Audit logging and activity tracking

### 🛠️ [Developer Guide](./Dev_Guide/README.md) - **How It Works**

Essential for developers who need to understand:

- ⚙️ **System Architecture** - How components work together
- 🔧 **Setup & Configuration** - Automated CLI installer explained
- 🧩 **Extension Development** - Building custom functionality
- 📡 **API Integration** - REST and GraphQL implementation

**Core Systems Explained:**

- 🚀 Automated setup via vite.config.ts
- 🔐 JWT + OAuth authentication flow
- 🏗️ SvelteKit + Svelte 5 architecture
- 📊 Database abstraction and optimization

## 🚀 Quick Start

### For Users (Content Management)

```
1. 🌐 Access your CMS URL
2. 🔑 Log in securely
3. 📝 Start creating content
4. 🛡️ Enjoy built-in security
```

### For Developers (Technical Setup)

```bash
git clone https://github.com/SveltyCMS/SveltyCMS.git
cd SveltyCMS
bun install
bun run dev  # CLI installer launches automatically
```

## 🔧 Key Features & Security

- **🎨 Modern Interface**: Built with SvelteKit and Tailwind CSS
- **🚀 Automated Setup**: CLI installer handles all configuration
- **🔐 Security First**: JWT + OAuth with granular permissions
- **📱 Responsive**: Works seamlessly on all devices
- **🌍 i18n Ready**: Multi-language support built-in
- **⚡ Performance**: Optimized for speed and efficiency
- **🧩 Extensible**: Custom widgets, themes, and plugins

## 📖 Essential Documentation

### User Documentation (Security-Focused)

- [🚀 First Steps](./User_Guide/00_Getting_Started/First_Steps.md) - Get started safely
- [👥 User Registration](./User_Guide/User_Registration.md) - Secure account creation
- [🛡️ Admin Management](./User_Guide/Admin_User_Management.md) - Secure administration
- [❓ FAQ](./User_Guide/17_FAQ/README.md) - Common security questions

### Developer Documentation (How It Works)

- [⚙️ Installation & Setup](./Dev_Guide/00_Installation/README.md) - Automated installer explained
- [🔐 Authentication System](./Dev_Guide/01_Authentication/README.md) - Security implementation
- [⚡ Cache System](./Cache_System.mdx) - Dual-layer caching (Redis + MongoDB)
- [⚙️ System Settings & Import/Export](./System_Settings.mdx) - Configuration management
- [📡 API Reference](./Dev_Guide/API_User_Token_Management.md) - Complete API docs
- [🧩 Svelte 5 Patterns](./Dev_Guide/Svelte5_Patterns.md) - Modern development patterns

## 🛡️ Security Promise

SveltyCMS is designed with security as a core principle:

- **🔒 Data Protection**: All data encrypted at rest and in transit
- **🛡️ Access Control**: Granular role-based permissions
- **📝 Audit Logging**: Complete activity tracking
- **🔍 Input Validation**: Automatic sanitization and validation
- **🚨 Security Updates**: Regular security patches and updates

## 🆘 Getting Help

- **[GitHub Issues](https://github.com/SveltyCMS/SveltyCMS/issues)** - Bug reports and feature requests
- **[GitHub Discussions](https://github.com/SveltyCMS/SveltyCMS/discussions)** - Community support
- **[Security Reports](mailto:security@sveltycms.dev)** - Responsible disclosure

## 📋 System Requirements

- **Browser**: Chrome, Firefox, Safari, Edge (latest versions)
- **JavaScript**: Required (security features depend on it)
- **Node.js**: 18+ for development
- **Database**: MongoDB (recommended) or PostgreSQL/SQLite
- **Redis**: Optional but recommended for caching

---

# System Architecture (2025+)

## Database-Driven Configuration

SveltyCMS uses a **modern, database-driven approach** for all configuration:

### Dynamic Settings (Database)

- ✅ 58 settings across 13 groups (General, Email, Security, Cache, etc.)
- ✅ Real-time updates without server restart
- ✅ Role-based access control
- ✅ Admin GUI at `/config/systemsetting`
- ✅ RESTful API: `/api/settings/[group]`

### Static Config (Minimal)

- Database connection strings
- JWT secrets and encryption keys
- OAuth client credentials
- Environment-specific startup config

## Import/Export System

**Drupal CMS-inspired configuration management:**

### Export Configuration

```bash
POST /api/export/full
{
  "includeSettings": true,
  "includeCollections": false,
  "includeSensitive": false
}
```

### Import Configuration

```bash
POST /api/import/full
{
  "data": { /* exported config */ },
  "options": {
    "strategy": "merge",  // skip | overwrite | merge
    "dryRun": true        // validate before applying
  }
}
```

### Workflows Enabled

- ✅ **Staging → Production**: Export from staging, import to production
- ✅ **Version Control**: Store configs in git
- ✅ **Team Collaboration**: Share configuration files
- ✅ **Backup & Restore**: Daily automated backups
- ✅ **Environment-Specific**: Dev/staging/prod configs

## Cache System

**Dual-layer caching for exceptional performance:**

- **Layer 1 (Redis)**: Ultra-fast in-memory cache (~1ms reads)
- **Layer 2 (MongoDB)**: Persistent cache across restarts
- **8 TTL Categories**: Static, Dynamic, API, Query, Session, Widget, Computed, Media
- **Automatic Expiration**: TTL-based with configurable values
- **UI Management**: Configure via System Settings

See [Cache System Documentation](./Cache_System.mdx) for details.

## Migration from Legacy Config

### Old Approach (Deprecated)

- Static config files with CLI prompts
- Hard-coded settings in code
- Manual file editing for changes
- No import/export capability

### New Approach (Current)

1. **Database-driven settings** - All config in MongoDB
2. **RESTful API** - Programmatic access via `/api/settings/*`
3. **Admin GUI** - User-friendly interface at `/config/systemsetting`
4. **Import/Export** - Environment management with validation
5. **Version Control** - Config files in git alongside code

### Migration Steps (for existing installations)

1. Update to latest version: `git pull && bun install`
2. Run database migration: `bun run migrate`
3. Export old config: Legacy settings auto-migrated
4. Verify settings: Check `/config/systemsetting`
5. Test import/export: Try exporting and re-importing
6. Update deployment scripts: Use new API endpoints

---

**New to SveltyCMS?** Start with [First Steps](./User_Guide/00_Getting_Started/First_Steps.md) for users or [Installation](./Dev_Guide/00_Installation/README.md) for developers.
