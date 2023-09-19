import {DependenciesKeys, FolderHistory, PackageJson} from "../types";
import {AxiosError} from "axios";
import * as bitbucketAPI from "../api/bitbucket";

function logError(error: AxiosError) {
    console.error('Error:', error.response?.data || error.message);
}

export class BitbucketPackageUpdater {
    fileName = 'package.json';
    private fileJson: PackageJson | null = null;
    private branchName = '';

    async getLastFileCommitHash(fileName: string): Promise<string> {
        const folderHistory: FolderHistory = await bitbucketAPI.getFolderHistory()

        const commitHash = folderHistory.values.find(v => v.path === fileName)?.commit.hash;

        if (!commitHash) {
            throw new Error(`${fileName} doesn’t exist in src`)
        }

        return commitHash;
    }

    async getFile() {
        const hash = await this.getLastFileCommitHash(this.fileName)
        this.fileJson = await bitbucketAPI.getFile(this.fileName, hash)

        console.log('Get package.json successfully.');

        return this.fileJson;
    }

    updateDependencies(packageName: DependenciesKeys = 'testPackage', version: string) {
        if (this.fileJson?.dependencies?.[packageName]) {
            this.fileJson.dependencies[packageName] = version;

            return this.fileJson;
        } else {
            throw new Error(`${packageName} does not exist in package.json dependency `)
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

        await bitbucketAPI.commit({
            message: `Update from script ${new Date()}`,
            branch: this.branchName,
            changes: {
                [this.fileName]: JSON.stringify(this.fileJson),
            }
        })

        console.log('Updated package.json successfully.');
    }

    async createPullRequest() {
        await bitbucketAPI.creatPullRequest({fromBranch: this.branchName, title: 'Update package.json from script'})

        console.log('Opened a pull request.');
    }
}
