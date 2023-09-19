import axios from "axios";
import {FolderHistory} from "../types";
import {accessToken, repoSlug, workspace} from "../config";

const WORKSPACE_URL = `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}`;

export async function getFolderHistory(): Promise<FolderHistory> {
    const response = await axios.get(
        `${WORKSPACE_URL}/src`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    return response.data;
}

export async function getFile<T>(fileName: string, hash: string): Promise<T> {
    const response = await axios.get(
        `${WORKSPACE_URL}/src/${hash}/${fileName}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    return response.data;
}

export async function creatPullRequest({fromBranch, toBranch = 'master', title}: {fromBranch: string, toBranch?: string, title: string}) {
    await axios.post(
        `${WORKSPACE_URL}/pullrequests`,
        {
            title: title,
            source: {
                branch: {
                    name: fromBranch
                },
            },
            destination: {
                branch: {
                    name: toBranch
                },
            },
            close_source_branch: true,
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );
}

export async function commit({message, branch,changes }: {message: string, branch: string,changes: Record<string, string> }) {
    await axios.post(
        `${WORKSPACE_URL}/src`,
        {
            message,
            branch,
            ...changes
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data',
            },
        }
    );
}
