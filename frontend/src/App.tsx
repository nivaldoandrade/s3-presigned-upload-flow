import { PackageOpenIcon, PlusIcon, XIcon } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';
import { uploadFile } from './services/uploadFile';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, startTransition] = useTransition();

  async function handleUploadFiles() {
    startTransition(async () => {
      const response = await Promise.allSettled(files.map(uploadFile));

      response.forEach((response, index) => {
        if (response.status === 'rejected') {
          console.log(
            `O upload do arquivo ${files[index].name} deu erro.`,
          );
        }
      });
    });
  }

  function handleRemoveFile(index: number) {
    setFiles(prevState => {
      const newFiles = [...prevState];

      newFiles.splice(index, 1);

      return newFiles;
    });
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: ((acceptedFiles: File[]) => {
      setFiles(prevState => prevState.concat(acceptedFiles));
    }),
  });

  return (
    <div className='min-h-svh flex justify-center'>
      <div className='w-full max-w-2xl mt-10 px-4'>
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col justify-center items-center w-full h-72 rounded-4xl border-2 border-gray-300 border-dashed cursor-pointer transition-all',
            isDragActive && 'bg-gray-200/50',
          )}
        >
          <input {...getInputProps()} />

          {!isDragActive ? (
            <>
              <PackageOpenIcon size={70} strokeWidth={1} />
              <span className='text-2xl text-gray-950 mt-2 text-center'>
                Arraste e solte os arquivos ou clique para selecionar
              </span>
              {/* <small className='text-sm text-gray-500'>Apenas arquivos até 1MB</small> */}
            </>
          ) : (
            <>
              <PlusIcon size={70} strokeWidth={1} />
              {/* <small className='text-sm text-gray-500'>Apenas arquivos até 1MB</small> */}
            </>
          )}
        </div>

        {files.length > 0 && (
          <div className='mt-10'>
            <h2 className="text-2xl font-medium">
              Arquivos Selecionados ({files.length})
            </h2>
            {files.map((file, index) => (
              <div key={file.name} className='border-b-2 p-3 m-2 flex justify-between items-center'>
                <span className='truncate'>{file.name}</span>
                <Button
                  variant='destructive'
                  size='icon'
                  onClick={() => handleRemoveFile(index)}
                >
                  <XIcon size={24} />
                </Button>
              </div>
            ))}

            <Button
              className='w-full mt-8 p-6'
              onClick={handleUploadFiles}
              disabled={isLoading}
            >
              Confirmar o upload
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
