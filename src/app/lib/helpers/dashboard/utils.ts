import SerializableFile from "@/app/types/serializableFile";
import {
  cacheFormState,
  getFormStateFromCache,
} from "@/app/lib/redis/analysisCache";
import { CVMatch } from "@/app/lib/ai/types";

interface ResultWithId extends CVMatch {
  cacheId: string;
}

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

async function loadCVFormState(setters: {
  setCVs: Function;
  setJD: Function;
  setJDFile: Function;
  setTopCount: Function;
  setResults: Function;
}) {
  const savedState = await getFormStateFromCache();
  const deserializedCVFiles =
    savedState?.serializedCVFiles?.map(deserializeFile);

  if (deserializedCVFiles) {
    setters.setCVs(deserializedCVFiles);
  }
  if (savedState?.serializedJobDescriptionFile) {
    const deserializedJobDescriptionFile = deserializeFile(
      savedState.serializedJobDescriptionFile
    );
    setters.setJDFile(deserializedJobDescriptionFile);
  }
  if (savedState?.jobDescription) {
    setters.setJD(savedState.jobDescription);
  }
  if (savedState?.topCount) {
    setters.setTopCount(savedState.topCount);
  }
  if (savedState?.results) {
    setters.setResults(savedState.results);
  }
}

async function saveCVFormState(refs: {
  cvFiles: File[];
  jobDescriptionFile?: File;
  jobDescription: string;
  topCount: number;
  results: ResultWithId[];
}) {
  const serializedCVFiles = await Promise.all(
    refs.cvFiles.map((cvFile) => serializeFile(cvFile))
  );

  const serializedJobDescriptionFile = refs.jobDescriptionFile
    ? await serializeFile(refs.jobDescriptionFile)
    : undefined;

  await cacheFormState({
    serializedCVFiles,
    serializedJobDescriptionFile,
    jobDescription: refs.jobDescription,
    topCount: refs.topCount,
    results: refs.results,
  });
}

export {
  handleDragLeave,
  handleDragOver,
  getFileIcon,
  serializeFile,
  deserializeFile,
  loadCVFormState,
  saveCVFormState,
};
