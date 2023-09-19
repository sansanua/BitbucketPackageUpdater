import axios, {AxiosError} from 'axios';
import {ACCESS_TOKEN} from './config'
import {DependenciesKeys, FolderHistory, PackageJson} from "./types";

const accessToken = ACCESS_TOKEN;
const workspace = 'mazurko';
const repoSlug = 'test';
const filePath = 'package.json';

function logError(error: AxiosError) {
    console.error('Error:', error.response?.data || error.message);
}

class BitbucketPackageUpdater {
    private fileJson: PackageJson | null = null;
    private hash: string = '';
    private branchName = '';

    async getLastFileCommitHash(fileName: string): Promise<string> {
        const response = await axios.get(
            `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/src`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const data: FolderHistory = response.data;
        const commitHash = data.values.find(v => v.path === fileName)?.commit.hash;

        if (!commitHash) {
            throw new Error(`${fileName} doesn’t exist in src`)
        }

        this.hash = commitHash;
        return commitHash;
    }
    async getFile(fileName: string) {
        try {
            const hash = await this.getLastFileCommitHash(fileName)

            const response = await axios.get(
                `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/src/${hash}/${fileName}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            this.fileJson = response.data;
            console.log(this.fileJson)
        }
        catch (error: any) {
            logError(error)
        }
    }

    updateDependencies(packageName: DependenciesKeys = 'testPackage', version: string) {
        if (this.fileJson?.dependencies?.[packageName]) {
            this.fileJson.dependencies[packageName] = version;

            return this.fileJson;
        } else {

            throw new Error(`${packageName} doesn’t exist in package.json dependency `)
            // this.fileJson = {
            //     ...this.fileJson as PackageJson,
            //     dependencies: {
            //         [packageName]: version,
            //     }
            // }
        }

    }

    async pushChanges() {
        this.branchName = `Update_from_script_${new Date().getTime()}`

        await axios.post(
            `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/src`,
            {
                message: `Update from script ${new Date()}`,
                branch: this.branchName,
                [filePath]: JSON.stringify(this.fileJson),
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        console.log('Updated package.json successfully.');
    }

    async createPullRequest() {
        await axios.post(
            `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/pullrequests`,
            {
                title: 'Update package.json from script',
                source: {
                    branch: {
                        name: this.branchName
                    },
                },
                destination: {
                    branch: {
                        name: 'master'
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

        console.log('Opened a pull request.');
    }
}

async function updatePackageJson() {
    try {
        const bitBucket = new BitbucketPackageUpdater()
        await bitBucket.getFile(filePath)
        console.log(bitBucket.updateDependencies('testPackage', '1.0.1'));
        console.log('File updated')

        await bitBucket.pushChanges()

        await bitBucket.createPullRequest()

    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
    }
}


updatePackageJson();
