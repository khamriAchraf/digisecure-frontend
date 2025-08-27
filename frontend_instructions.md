Title: Build a SharePoint-like Document Manager UI using the Documents API

Audience: Frontend AI building a complete, intuitive UI for folders and documents, with versioning and uploads.

Base URL: `/api/v1/documents`

Goals
- Provide a left navigation folder tree and breadcrumbs
- Display folder contents (subfolders + documents) in a rich grid/list
- Support document uploads (initial and new versions), downloads, deletes
- Manage folders (create, rename, move via parenting), delete
- Paginated, searchable document listing, filterable by folder
- Move documents between folders and update metadata

Key Endpoints
- Folders
  - GET `/documents/folders`?`parent_id` (list folders under parent; omit to list roots)
  - POST `/documents/folders` body: `{ name, parent_id? }` → create folder
  - PUT `/documents/folders/{folder_id}` body: `{ name?, parent_id? }` → rename / move folder
  - DELETE `/documents/folders/{folder_id}` → delete folder (cascades)
  - GET `/documents/folders/tree` → complete hierarchy for navigation
  - GET `/documents/folders/{folder_id}` → folder details + immediate subfolders + documents

- Documents
  - GET `/documents` with pagination and filters → paginated list of documents
    - Query: `page?`, `per_page?`, `cursor?`, `sort_by?`, `sort_order?`, `search?`, and arbitrary `filters` like `folder_id`
    - Response: `PaginatedResponse<Document>` `{ data, total, page, per_page, total_pages }`
  - POST `/documents` (multipart/form-data) → create a document with first version
    - Form fields: `name` (text), `description?` (text), `folder_id?` (text/number), `file` (binary)
  - GET `/documents/{document_id}` → `DocumentWithVersions`
  - PATCH `/documents/{document_id}` body: `{ name?, description?, folder_id? }` → update/move
  - DELETE `/documents/{document_id}` → delete document (removes version files)

- Versions
  - GET `/documents/{document_id}/versions` → list `DocumentVersion[]`
  - POST `/documents/{document_id}/versions` (multipart) with `file` → upload new version
  - DELETE `/documents/versions/{version_id}` → delete version
  - GET `/documents/versions/{version_id}/download` → download binary

Resource Shapes (summary)
- Document: `{ id, name, description?, folder_id?, created_at, updated_at }`
- DocumentWithVersions: `Document` + `{ versions: DocumentVersion[] }`
- DocumentVersion: `{ id, document_id, version_number, file_path, file_name, file_size?, checksum?, uploaded_by?, uploaded_at }`
- DocumentFolder: `{ id, name, parent_id?, created_at, updated_at }`
- DocumentFolderNode: recursive `{ id, name, children: DocumentFolderNode[] }` with a virtual root `{ id: 0, name: "root" }`
- FolderContents: `{ folder: DocumentFolder, subfolders: DocumentFolder[], documents: Document[] }`

UI Blueprint
- Layout
  - Left side: Folder Tree (from GET `/documents/folders/tree`).
    - Expand/collapse nodes. Lazy loading optional but tree returns full hierarchy.
    - Clicking a node updates center content to that folder.
  - Header: Breadcrumb reflecting current folder path (build from traversing tree by id).
  - Toolbar for current folder: New Folder, Upload, Search box, Optional filters, Sort controls.
  - Main content: Folder Contents grid/list (GET `/documents/folders/{folder_id}`)
    - Show subfolders first, then documents.
    - Columns: name, modified, size (latest version), versions count, actions (download latest, upload new version, rename, move, delete).
  - Right pane or modal: Document details with versions list and actions (download/delete version).

- Primary Flows
  1) Initial Load
     - Fetch tree: GET `/documents/folders/tree`
     - Fetch root contents (if using a specific root id) via GET `/documents/folders/{folder_id}` or list root folders with GET `/documents/folders`
  2) Navigate Folder
     - Click in tree → GET `/documents/folders/{folder_id}` and update breadcrumb and list.
  3) Create Folder
     - Open modal, collect `name`. POST `/documents/folders` with `{ name, parent_id: currentFolderId }`.
     - Refresh folder list and tree.
  4) Upload Document (initial version)
     - Multipart POST `/documents` with form fields `name`, optional `description`, `folder_id` (current folder), `file`.
     - On success, append to current folder documents and update counts.
  5) Upload New Version
     - Multipart POST `/documents/{document_id}/versions` with `file`.
     - Refresh the document’s versions list and latest size/date in the grid.
  6) Download Version
     - GET `/documents/versions/{version_id}/download`.
  7) Move/Rename Document
     - PATCH `/documents/{document_id}` with `{ folder_id }` and/or `{ name, description }`.
     - If moved out of current folder, remove from current list; add to destination on next load.
  8) Delete Version
     - DELETE `/documents/versions/{version_id}` then refresh the versions list.
  9) Delete Document
     - DELETE `/documents/{document_id}` then remove from current list.
  10) Search and Pagination
     - For general document listing (e.g., global search view) use GET `/documents` with `page/per_page/sort/search`.
     - For folder-scoped views, include `folder_id` filter with pagination.

Request Examples
- Create Folder
```http
POST /api/v1/documents/folders
Content-Type: application/json

{ "name": "Policies", "parent_id": 123 }
```

- Create Document with First Version (multipart)
```http
POST /api/v1/documents
Content-Type: multipart/form-data

name=Q1 Report&description=FY Q1 summary&folder_id=123&file=@/path/to/Q1.pdf
```

- List Documents with Pagination and Search
```http
GET /api/v1/documents?page=1&per_page=20&sort_by=name&sort_order=asc&search=report&folder_id=123
```

- Upload New Version
```http
POST /api/v1/documents/456/versions
Content-Type: multipart/form-data

file=@/path/to/Q1_v2.pdf
```

UI/UX Guidance
- Display folders above files; use distinct icons. Support drag-and-drop upload into current folder.
- Show version badge on documents (e.g., v3). Provide quick action to upload a new version.
- Add breadcrumb with clickable ancestors.
- Preserve scroll position and selection on navigation.
- Optimistic updates with rollback on failure where safe (e.g., renames).
- Error handling: surface 403 (permission), 404 (not found), 409 (conflict) with clear toasts.

Security & Permissions
- All endpoints enforce role-based permissions on the `document` resource.
- Expect 403 if the user lacks required permissions.

Performance Tips
- Cache the folder tree; invalidate on folder create/update/delete.
- Debounce search queries; use `search` param.

