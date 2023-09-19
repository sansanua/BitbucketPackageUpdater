import {BitbucketPackageUpdater} from "./models/BitbucketPackageUpdater";

async function updatePackageJson() {
    try {
        const bitBucket = new BitbucketPackageUpdater()

        await bitBucket.getFile()
        bitBucket.updateDependencies('testPackage', '1.0.1')
        await bitBucket.pushChanges()
        await bitBucket.createPullRequest()

    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
    }
}


updatePackageJson();
