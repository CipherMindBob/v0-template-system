import Image from "next/image"

interface ContentBlockProps {
  text: string
  image?: string
}

export function ContentBlock({ text, image }: ContentBlockProps) {
  return (
    <div className="py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {image && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <Image
              src={image || "/placeholder.svg"}
              alt="Content image"
              width={800}
              height={400}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div className="prose max-w-none">
          {text.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
