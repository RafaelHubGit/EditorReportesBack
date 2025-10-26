import { Folder } from '../models/Folder.model';
import { Template } from '../models/Template.model';
import { IFolder } from '../types/mongo.types';

export class FolderService {
    // Crear un nuevo folder
    static async createFolder(folderData: Partial<IFolder>): Promise<IFolder> {
        try {
        const folder = new Folder(folderData);
        return await folder.save();
        } catch (error) {
        throw new Error(`Error creating folder: ${error.message}`);
        }
    }

    // Obtener folders por usuario (con estructura de árbol)
    static async getFoldersByUser(userId: string, includeTemplates: boolean = false): Promise<IFolder[]> {
        try {
        const folders = await Folder.find({ owner: userId })
            .sort({ createdAt: -1 })
            .exec();

        if (includeTemplates) {
            // Populate templates si se solicita
            return await Folder.populate(folders, {
            path: 'templateIds',
            select: 'name createdAt'
            });
        }

        return folders;
        } catch (error) {
        throw new Error(`Error fetching folders: ${error.message}`);
        }
    }

    // Obtener folder por ID con sus templates
    static async getFolderById(folderId: string, userId: string): Promise<IFolder | null> {
        try {
        return await Folder.findOne({
            _id: folderId,
            $or: [
            { owner: userId },
            { sharedWith: userId }
            ]
        })
        .populate('templateIds', 'name html css jsonSchema sampleData createdAt')
        .exec();
        } catch (error) {
        throw new Error(`Error fetching folder: ${error.message}`);
        }
    }

    // Actualizar folder
    static async updateFolder(
        folderId: string, 
        userId: string, 
        updateData: Partial<IFolder>
    ): Promise<IFolder | null> {
        try {
        return await Folder.findOneAndUpdate(
            { 
            _id: folderId, 
            owner: userId  // Solo el owner puede actualizar
            },
            updateData,
            { new: true, runValidators: true }
        ).exec();
        } catch (error) {
        throw new Error(`Error updating folder: ${error.message}`);
        }
    }

    // Eliminar folder (y mover templates a root si es necesario)
    static async deleteFolder(folderId: string, userId: string, moveTemplatesToRoot: boolean = true): Promise<boolean> {
        try {
        const folder = await Folder.findOne({
            _id: folderId,
            owner: userId
        });

        if (!folder) {
            return false;
        }

        // Si el folder tiene templates, moverlos a root o eliminarlos
        if (folder.templateIds.length > 0 && moveTemplatesToRoot) {
            await Template.updateMany(
            { _id: { $in: folder.templateIds } },
            { $unset: { folderId: 1 } }  // Remover referencia al folder
            );
        }

        // Eliminar el folder
        const result = await Folder.deleteOne({ _id: folderId, owner: userId }).exec();
        return result.deletedCount > 0;
        } catch (error) {
        throw new Error(`Error deleting folder: ${error.message}`);
        }
    }

    // Mover template a folder
    static async moveTemplateToFolder(
        templateId: string, 
        folderId: string | null,  // null = mover a root
        userId: string
    ): Promise<boolean> {
        try {
        // Verificar que el template pertenece al usuario
        const template = await Template.findOne({
            _id: templateId,
            owner: userId
        });

        if (!template) {
            throw new Error('Template not found or access denied');
        }

        // Si folderId es null, mover a root (eliminar folderId)
        if (folderId === null) {
            await Template.updateOne(
            { _id: templateId },
            { $unset: { folderId: 1 } }
            );
            
            // Remover de cualquier folder que lo contenga
            await Folder.updateMany(
            { templateIds: templateId },
            { $pull: { templateIds: templateId } }
            );
            
            return true;
        }

        // Verificar que el folder pertenece al usuario
        const folder = await Folder.findOne({
            _id: folderId,
            owner: userId
        });

        if (!folder) {
            throw new Error('Folder not found or access denied');
        }

        // Remover template de cualquier folder anterior
        await Folder.updateMany(
            { templateIds: templateId },
            { $pull: { templateIds: templateId } }
        );

        // Agregar template al nuevo folder
        await Folder.updateOne(
            { _id: folderId },
            { $addToSet: { templateIds: templateId } }
        );

        // Actualizar referencia en el template
        await Template.updateOne(
            { _id: templateId },
            { folderId: folderId }
        );

        return true;
        } catch (error) {
        throw new Error(`Error moving template: ${error.message}`);
        }
    }

    // Obtener folder tree (para estructura jerárquica)
    static async getFolderTree(userId: string): Promise<any[]> {
        try {
        const folders = await Folder.find({ owner: userId })
            .select('name parentId templateIds icon color')
            .sort({ name: 1 })
            .exec();

        // Construir árbol jerárquico
        const buildTree = (parentId: string | null = null) => {
            return folders
            .filter(folder => 
                (parentId === null && !folder.parentId) || 
                folder.parentId?.toString() === parentId
            )
            .map(folder => ({
                id: folder._id,
                name: folder.name,
                icon: folder.icon,
                color: folder.color,
                templateCount: folder.templateIds.length,
                subfolders: buildTree(folder._id.toString())
            }));
        };

        return buildTree();
        } catch (error) {
        throw new Error(`Error building folder tree: ${error.message}`);
        }
    }

    // Crear subfolder
    static async createSubfolder(
        parentFolderId: string,
        subfolderData: Partial<IFolder>,
        userId: string
    ): Promise<IFolder> {
        try {
        // Verificar que el folder padre existe y pertenece al usuario
        const parentFolder = await Folder.findOne({
            _id: parentFolderId,
            owner: userId
        });

        if (!parentFolder) {
            throw new Error('Parent folder not found or access denied');
        }

        const subfolder = new Folder({
            ...subfolderData,
            owner: userId,
            parentId: parentFolderId
        });

        return await subfolder.save();
        } catch (error) {
        throw new Error(`Error creating subfolder: ${error.message}`);
        }
    }

    // Compartir folder con otros usuarios
    static async shareFolder(
        folderId: string,
        userId: string,
        targetUserIds: string[],
        isPublic: boolean = false
    ): Promise<IFolder | null> {
        try {
        return await Folder.findOneAndUpdate(
            { 
            _id: folderId, 
            owner: userId  // Solo el owner puede compartir
            },
            {
            $addToSet: { sharedWith: { $each: targetUserIds } },
            isShared: isPublic || targetUserIds.length > 0
            },
            { new: true, runValidators: true }
        ).exec();
        } catch (error) {
        throw new Error(`Error sharing folder: ${error.message}`);
        }
    }
}