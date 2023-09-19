export type DependenciesKeys = 'axios' | 'testPackage'

export type PackageJson = {
    name: string;
    version: string;
    description: string;
    main: string;
    scripts: {
        start: string;
    };
    keywords: string[];
    author: string;
    license: string;
    devDependencies: Record<string, string>;
    dependencies: Partial<Record<DependenciesKeys, string>>;
};

export type CommitFile = {
    path: string;
    commit: {
        hash: string;
        links: {
            self: { href: string };
            html: { href: string };
        };
        type: string;
    };
    type: string;
    attributes: any[];
    escaped_path: string;
    size: number;
    mimetype: string | null;
    links: {
        self: { href: string };
        meta: { href: string };
        history: { href: string };
    };
};

export type FolderHistory = {
    values: CommitFile[];
    pagelen: number;
    page: number;
};
