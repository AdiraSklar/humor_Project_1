import { Caption } from '@/types/caption';
import { handleVote } from './actions';

type CaptionsPageProps = {
  captions: Caption[];
  imagesMap: { [key: string]: string };
};

export default function CaptionsPage({ captions, imagesMap }: CaptionsPageProps) {
  return (
    <div className="flex-1 w-full flex flex-col gap-10 items-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen p-4">
      <h1 className="text-3xl font-bold">Rate Captions</h1>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {captions.map((caption) => (
          <div key={caption.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {imagesMap[caption.image_id] && (
              <img src={imagesMap[caption.image_id]} alt="Caption image" className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <p className="text-lg">{caption.content}</p>
              <div className="flex justify-end gap-2 mt-4">
                <form action={handleVote}>
                  <input type="hidden" name="captionId" value={caption.id} />
                  <input type="hidden"name="voteValue" value={1} />
                  <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                    Upvote
                  </button>
                </form>
                <form action={handleVote}>
                  <input type="hidden" name="captionId" value={caption.id} />
                  <input type="hidden" name="voteValue" value={-1} />
                  <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                    Downvote
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
