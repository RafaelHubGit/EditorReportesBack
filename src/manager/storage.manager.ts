import { IStorageProvider } from '../interface/IStorageProvider.interface';
import { FileSystemProvider } from '../providers/storage/FileSystemProvider';
import { GCSProvider } from '../providers/storage/GCSProvider';

export class StorageManager {
    private static instance: IStorageProvider;

    /**
     * Returns the correct provider based on PROJECT_MODE.
     * It follows the Singleton pattern to avoid re-instantiating 
     * providers on every call.
     */
    static getProvider(): IStorageProvider {
        if (this.instance) return this.instance;

        // Check the environment variable
        const mode = process.env.PROJECT_MODE || 'local';

        if (mode === 'saas') {
            // Use Google Cloud Storage for production/SaaS
            this.instance = new GCSProvider();
        } else {
            // Use Local File System for development
            this.instance = new FileSystemProvider();
        }

        return this.instance;
    }
}