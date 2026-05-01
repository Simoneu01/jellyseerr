import { MediaStatus } from '@server/constants/media';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import Media from './Media';

@Entity()
@Unique(['requestProfileId', 'media'])
class MediaProfileStatus {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'int' })
  @Index()
  public requestProfileId: number;

  @Column({ type: 'int', default: MediaStatus.UNKNOWN })
  @Index()
  public status: MediaStatus;

  @Column({ nullable: true, type: 'int' })
  public serviceId?: number | null;

  @Column({ nullable: true, type: 'int' })
  public externalServiceId?: number | null;

  @Column({ nullable: true, type: 'varchar' })
  public externalServiceSlug?: string | null;

  @ManyToOne(() => Media, (media) => media.profileStatuses, {
    onDelete: 'CASCADE',
  })
  @Index()
  public media: Media;

  constructor(init?: Partial<MediaProfileStatus>) {
    Object.assign(this, init);
  }
}

export default MediaProfileStatus;
