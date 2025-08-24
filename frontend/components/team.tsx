import Image from "next/image";

const leads = [
  {
    name: "Arpit Sengar",
    role: "Project Lead",
    username: "arpy8",
  },
  {
    name: "Rohit Dwivedi",
    role: "Project Co Lead",
    username: "r0xx3d",
  },
];

const contributors = [
  {
    name: "Abhash Chakraborty",
    username: "Abhash-Chakraborty",
    role: "Contributor",
  },
  {
    name: "Manthan Awgan",
    username: "manthanawgan",
    role: "Contributor",
  },
  {
    name: "Swayam Prakash Panda",
    username: "Swayam200",
    role: "Contributor",
  },
  {
    name: "Abhay Tyagi",
    username: "crowaltz24",
    role: "Contributor",
  },
  {
    name: "Aryan Pahari",
    username: "Aryan-coder-student",
    role: "Contributor",
  },
  {
    name: "Avnish",
    username: "Avnish1447",
    role: "Contributor",
  },
  {
    name: "Shantam",
    username: "Justshantam",
    role: "Contributor",
  },
  {
    name: "Pari Goel",
    username: "iparigoel",
    role: "Contributor",
  },
  {
    name: "Jai Dhuria",
    username: "Jaidhuria",
    role: "Contributor",
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-12">
      <div className="mx-auto max-w-3xl px-8 lg:px-0">
        <h2 className="mb-8 text-4xl font-bold md:mb-16 lg:text-5xl">
          Our team
        </h2>

        <div>
          <h3 className="mb-6 text-lg font-medium">Leadership</h3>
          <div className="grid grid-cols-2 gap-4 border-t py-6 md:grid-cols-4">
            {leads.map((lead, index) => (
              <div key={index}>
                <div className="bg-background size-20 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                  <a
                    href={`https://github.com/${lead.username}`}
                    target="_blank"
                  >
                    <Image
                      className="aspect-square rounded-full object-cover hover:scale-110 transition-transform duration-200"
                      src={`https://avatars.githubusercontent.com/${lead.username}`}
                      alt={lead.name}
                      height={460}
                      width={460}
                      loading="lazy"
                    />
                  </a>
                </div>
                <span className="mt-2 block text-sm">{lead.name}</span>
                <span className="text-muted-foreground block text-xs">
                  {lead.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-6 text-lg font-medium">Contributors</h3>
          <div
            data-rounded="full"
            className="grid grid-cols-2 gap-4 border-t py-6 md:grid-cols-4"
          >
            {contributors.map((contributor, index) => (
              <div key={index}>
                <div className="bg-background size-20 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                  <a
                    href={`https://github.com/${contributor.username}`}
                    target="_blank"
                  >
                    <Image
                      className="aspect-square rounded-full object-cover hover:scale-110 transition-transform duration-200"
                      src={`https://avatars.githubusercontent.com/${contributor.username}`}
                      alt={contributor.name}
                      height={460}
                      width={460}
                      loading="lazy"
                    />
                  </a>
                </div>
                <span className="mt-2 block text-sm">{contributor.name}</span>
                <span className="text-muted-foreground block text-xs">
                  {contributor.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}