import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      /** Яндекс: исключить фрагмент из индекса/сниппета. */
      noindex: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
