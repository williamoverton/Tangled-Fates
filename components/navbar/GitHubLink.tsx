import { GitHubIcon } from "@/components/ui/github-icon";

export function GitHubLink() {
  return (
    <a
      href="https://github.com/williamoverton/Tangled-Fates"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
      aria-label="View on GitHub"
    >
      <GitHubIcon className="w-5 h-5" />
      <span className="hidden sm:inline">GitHub</span>
    </a>
  );
}
