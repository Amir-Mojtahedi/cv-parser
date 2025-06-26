import SerializableFile from "@/app/types/serializableFile";

const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.add(
    "border-blue-500",
    "bg-blue-50",
    "dark:bg-blue-900/20"
  );
};

const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove(
    "border-blue-500",
    "bg-blue-50",
    "dark:bg-blue-900/20"
  );
};

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "📄";
    case "doc":
    case "docx":
      return "📝";
    case "txt":
      return "📋";
    case "png":
    case "jpg":
    case "jpeg":
      return "🖼️";
    case "pptx":
      return "📊";
    default:
      return "📎";
  }
};

async function serializeFile(file: File): Promise<SerializableFile> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    content: base64,
  };
}

function deserializeFile(serialized: SerializableFile): File {
  const binary = atob(serialized.content);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([array], { type: serialized.type });
  return new File([blob], serialized.name, {
    type: serialized.type,
    lastModified: Date.now(),
  });
}

export {
  handleDragLeave,
  handleDragOver,
  getFileIcon,
  serializeFile,
  deserializeFile,
};
