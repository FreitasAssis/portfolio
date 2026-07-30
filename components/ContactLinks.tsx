import { CONTACT_LINKS, type ContactLink } from '@/content/contact';

function LinkItem({ link }: { readonly link: ContactLink }) {
  const external = link.external
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  return (
    <li>
      <a
        href={link.href}
        className="text-accent-text underline underline-offset-4"
        {...(link.download ? { download: true } : {})}
        {...external}
      >
        {link.label}
      </a>
    </li>
  );
}

export function ContactLinks() {
  return (
    <ul className="space-y-2 font-mono text-xs">
      {CONTACT_LINKS.map((link) => (
        <LinkItem key={link.href} link={link} />
      ))}
    </ul>
  );
}
