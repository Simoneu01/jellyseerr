import { MediaStatus } from '@server/constants/media';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Media from './Media';

@Entity()
@Index(['mediaId', 'serviceId'], { unique: true })
class MediaServiceStatus {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @Index()
  public mediaId: number;

  @ManyToOne(() => Media, (media) => media.serviceStatuses, {
    onDelete: 'CASCADE',
  })
  public media: Media;

  @Column({ type: 'int' })
  @Index()
  public serviceId: number;

  @Column({ type: 'varchar' })
  public serviceType: 'radarr' | 'sonarr';

  @Column({ type: 'int', default: MediaStatus.UNKNOWN })
  public status: MediaStatus;

  @Column({ nullable: true, type: 'int' })
  public externalServiceId: number | null;

  @Column({ nullable: true, type: 'varchar' })
  public externalServiceSlug: string | null;

  constructor(init?: Partial<MediaServiceStatus>) {
    Object.assign(this, init);
  }
}

export default MediaServiceStatus;
