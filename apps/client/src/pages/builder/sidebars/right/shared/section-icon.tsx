import {
  DiamondsFour,
  DownloadSimple,
  IconProps,
  Layout,
  Note,
  Palette,
  ReadCvLogo,
  TextT,
  Translate,
} from "@phosphor-icons/react";
import { Button, ButtonProps, Tooltip } from "@reactive-resume/ui";

export type MetadataKey =
  | "template"
  | "layout"
  | "typography"
  | "theme"
  | "page"
  | "locale"
  | "export"
  | "notes";

export const getSectionIcon = (id: MetadataKey, props: IconProps = {}) => {
  switch (id) {
    // Left Sidebar
    case "notes": {
      return <Note size={18} {...props} />;
    }
    case "template": {
      return <DiamondsFour size={18} {...props} />;
    }
    case "layout": {
      return <Layout size={18} {...props} />;
    }
    case "typography": {
      return <TextT size={18} {...props} />;
    }
    case "theme": {
      return <Palette size={18} {...props} />;
    }
    case "page": {
      return <ReadCvLogo size={18} {...props} />;
    }
    case "locale": {
      return <Translate size={18} {...props} />;
    }
    case "export": {
      return <DownloadSimple size={18} {...props} />;
    }

    default: {
      return null;
    }
  }
};

type SectionIconProps = ButtonProps & {
  id: MetadataKey;
  name: string;
  icon?: React.ReactNode;
};

export const SectionIcon = ({ id, name, icon, ...props }: SectionIconProps) => (
  <Tooltip side="left" content={name}>
    <Button size="icon" variant="ghost" className="size-8 rounded-full" {...props}>
      {icon ?? getSectionIcon(id, { size: 14 })}
    </Button>
  </Tooltip>
);
