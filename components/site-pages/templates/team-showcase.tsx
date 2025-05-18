import Image from "next/image"
import Link from "next/link"

interface TeamMember {
  name: string
  role?: string
  title?: string
  image?: string
  slug: string
  href?: string
  bio?: string
  biography?: string[]
  socialLinks?: Array<{ platform: string; url: string }>
}

interface TeamShowcaseProps {
  title: string
  layout?: "grid" | "list"
  columns?: number
  members: TeamMember[]
}

export function TeamShowcase({ title, layout = "grid", columns = 3, members }: TeamShowcaseProps) {
  // Determine grid columns class
  const gridColumnsClass =
    {
      1: "md:grid-cols-1",
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
    }[columns] || "md:grid-cols-3"

  return (
    <div className="py-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>

        {layout === "grid" ? (
          <div className={`grid grid-cols-1 ${gridColumnsClass} gap-8`}>
            {members.map((member) => (
              <div key={member.slug} className="text-center">
                {member.image && (
                  <div className="mb-4 mx-auto w-40 h-40 relative overflow-hidden rounded-full">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      width={160}
                      height={160}
                      className="object-cover"
                    />
                  </div>
                )}

                <h3 className="text-xl font-semibold">{member.name}</h3>
                {member.role && <p className="text-muted-foreground mb-2">{member.role}</p>}
                {member.bio && <p className="text-sm">{member.bio}</p>}

                {member.href && (
                  <Link href={member.href} className="text-primary hover:underline text-sm mt-2 inline-block">
                    View Profile
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {members.map((member) => (
              <div key={member.slug} className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {member.image && (
                  <div className="w-32 h-32 relative overflow-hidden rounded-full shrink-0">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  {member.role && <p className="text-muted-foreground mb-2">{member.role}</p>}
                  {member.bio && <p className="text-sm">{member.bio}</p>}

                  {member.href && (
                    <Link href={member.href} className="text-primary hover:underline text-sm mt-2 inline-block">
                      View Profile
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
