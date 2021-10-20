export type ReadFileType = string | ArrayBuffer | null;

export interface IFileWithBase64 extends File {
  base64: ReadFileType;
}

export const readFile = (file: File): Promise<ReadFileType> => (
  new Promise((resolve, reject): void => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = reject;
    fileReader.readAsDataURL(file);
  })
);

export const readFiles = (files: File[]): Promise<Array<IFileWithBase64>> => {
  const filesPromises = files.map(file => readFile(file));

  return Promise.all(filesPromises)
    .then(readFiles => (
      readFiles.map((base64, index) => Object.assign(files[index], {base64}))
    ));
};
