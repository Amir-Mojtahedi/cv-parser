/**
 * Handles the drag-over event for a drag-and-drop area.
 * It prevents the default browser behavior and applies styling to indicate an active drop zone.
 * @param {React.DragEvent<HTMLDivElement>} e - The React drag event.
 */
const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.add(
    "border-blue-500",
    "bg-blue-50",
    "dark:bg-blue-900/20"
  );
};

/**
 * Handles the drag-leave event for a drag-and-drop area.
 * It prevents the default browser behavior and removes active styling from the drop zone.
 * @param {React.DragEvent<HTMLDivElement>} e - The React drag event.
 */
const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove(
    "border-blue-500",
    "bg-blue-50",
    "dark:bg-blue-900/20"
  );
};

export { handleDragLeave, handleDragOver };
