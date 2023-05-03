import matter from "gray-matter";

export default interface IPost {
    name: string;
    slug: string;
    path: string;
    frontmatter: {
        [key: string]: any;
    };
    content: string;
}