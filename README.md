# Table Connector App

## How to Deploy on GitHub Pages

This project is configured to be deployed to GitHub Pages using the `main` branch and the `/docs` folder.

1.  **Push the Code**: Ensure you have merged the changes from the `table-conn-build-main-docs` branch into your `main` branch.
2.  **Wait for the Action**: The GitHub Action will run automatically. It will build the project and create/update the `docs/` folder on your `main` branch.
3.  **Configure GitHub Pages**:
    *   Go to your repository on GitHub.
    *   Click on **Settings**.
    *   In the left sidebar, click on **Pages**.
    *   Under **Build and deployment**:
        *   **Source**: Select `Deploy from a branch`.
        *   **Branch**: Select `main`.
        *   **Folder**: Select `/docs` (this option will only appear *after* the `docs/` folder exists on the branch).
    *   Click **Save**.

After a few minutes, your site will be live at the URL displayed on the Pages settings page.

## Development

To run the project locally:

1.  `npm install`
2.  `npm run dev`
3.  Open `http://localhost:5173` in your browser.
