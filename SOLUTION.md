# SOLUTION.md

## Backend

### 1. Refactor Blocking I/O

- Replaced all synchronous file operations (`fs.readFileSync`, `fs.writeFileSync`) with asynchronous versions using `fs.promises`.
- All routes now use `async/await` for file access, improving scalability and responsiveness.
- **Trade-off:** For very high concurrency, a real database would be more robust than file-based storage.

### 2. Performance (Stats Endpoint)

- Implemented in-memory caching for `/api/stats` results.
- The cache is updated on server start and whenever the items file changes (using `fs.watch`).
- **Trade-off:** If the file is edited outside the app and not saved atomically, there may be a brief period with invalid cache.

### 3. Testing

- Added Jest + Supertest tests for all main routes, including happy path and error cases.
- Edge cases tested: invalid payloads, negative/invalid pagination, file corruption.

### 4. Error Handling & Edge Cases

- All errors are now returned as JSON with an `error` property, using a global error middleware.
- Payloads for POST `/api/items` are validated (required fields, types, non-negative price).
- Pagination parameters are sanitized (minimum 1).
- If the data file is missing or corrupted, a 500 error is returned with a clear message.
- **Trade-off:** File corruption or concurrent writes can still cause data loss; a database would be safer.

---

## Frontend

### 1. Memory Leak

- Fixed a potential memory leak in `Items.js` by ensuring state updates only occur if the component is still mounted.

### 2. Pagination & Search

- The list page now supports server-side pagination and search, using `page`, `limit`, and `q` query params.
- The UI updates automatically when the user searches or changes pages.

### 3. Performance (Virtualization)

- Integrated `react-window` to virtualize the item list, rendering only visible items for better performance with large lists.
- **Trade-off:** Virtualization adds a small complexity to the UI code, but greatly improves performance for large datasets.

### 4. UI/UX Polish

- Improved the look and feel: item cards, styled search bar, animated loading spinner, and modern pagination controls.
- Added error messages and loading states for better user feedback.

### 5. Error Handling

- If an item is not found, the detail page shows an error message before redirecting.
- All user inputs are sanitized and validated before sending to the backend.

---

## General Trade-offs

- The project uses a JSON file as a database for simplicity, which is not suitable for production or concurrent writes.
- All error handling is robust for the current stack, but a real-world app should use a database and more granular error logging/monitoring.
- The frontend is designed for clarity and usability, but could be further enhanced with accessibility and mobile-first improvements.
