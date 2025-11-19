import { CheckIcon, PackageOpenIcon, PlusIcon, XIcon } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useDropzone } from 'react-dropzone';
import { CircularProgress } from './components/CircularProgress';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';
import { uploadFile } from './services/uploadFile';

interface IUpload {
  file: File,
  progress: number;
};

function App() {
  const [uploads, setUploads] = useState<IUpload[]>([]);
  const [isLoading, startTransition] = useTransition();

  async function handleUploads() {
    startTransition(async () => {
      const response = await Promise.allSettled(
        uploads.map(async ({ file }, index) => {
          await uploadFile(file, (percent) => {
            setUploads(prevState => {
              const newState = [...prevState];

              newState[index] = {
                file,
                progress: percent,
              };

              return newState;
            });
          });
        }));

      response.forEach((response, index) => {
        if (response.status === 'rejected') {
          console.log(
            `O upload do arquivo ${uploads[index].file.name} deu erro.`,
          );
        }
      });
    });
  }

  function handleRemoveFile(index: number) {
    setUploads(prevState => {
      const newFiles = [...prevState];

      newFiles.splice(index, 1);

      return newFiles;
    });
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: ((acceptedFiles: File[]) => {
      setUploads(prevState => {
        const newUploads = acceptedFiles.map(acceptedFile => ({
          file: acceptedFile,
          progress: 0,
        }));

        return prevState.concat(newUploads);
      });
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

        {uploads.length > 0 && (
          <div className='mt-10'>
            <h2 className="text-2xl font-medium">
              Arquivos Selecionados ({uploads.length})
            </h2>
            <div className='mt-2'>
              {uploads.map(({ file, progress }, index) => (
                <div key={file.name} className='border-b-2 min-h-16 p-1 flex justify-between items-center gap-2'>
                  <span className='truncate'>{file.name}</span>

                  <div className='flex items-center '>
                    {(isLoading || progress > 0) ?
                      (
                        <CircularProgress
                          value={progress}
                          size={50}
                          strokeWidth={4}
                          showLabel
                          renderLabel={(progress) => {
                            if (progress === 100) {
                              return <CheckIcon
                                size={19}
                                strokeWidth={3}
                              />;
                            }
                          }}
                        />
                      ) : (
                        <Button
                          variant='destructive'
                          size='icon'
                          onClick={() => handleRemoveFile(index)}
                        >
                          <XIcon size={24} />
                        </Button>
                      )
                    }
                  </div>

                </div>
              ))}
            </div>

            <Button
              className='w-full mt-8 p-6'
              onClick={handleUploads}
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
