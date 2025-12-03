import 'reflect-metadata';
import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn 
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ 
        type: 'varchar', 
        unique: true, 
        length: 255 
    })
    email!: string;

    @Column({ 
        type: 'varchar', 
        length: 255 
    })
    password_hash!: string;

    @Column({ 
        type: 'varchar', 
        length: 255 
    })
    name!: string;

    @Column({ 
        type: 'varchar', 
        nullable: true, 
        length: 255 
    })
    google_id!: string;

    @Column({
        type: 'varchar',
        nullable: true,
        length: 255
    })
    refresh_token_hash?: string;

    @CreateDateColumn({ 
        type: 'timestamp' 
    })
    created_at!: Date;

    @UpdateDateColumn({ 
        type: 'timestamp' 
    })
    updated_at!: Date;
}