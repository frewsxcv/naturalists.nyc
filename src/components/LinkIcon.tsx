import { MdOpenInNew } from "react-icons/md";

export const LinkIcon = ({ url }: { url: string }) => {
    return <a href={url} target="_blank" rel="noreferrer"><MdOpenInNew /></a>;
};
