import { migrateProjectQueue } from '../queues';

const migrateProject = async (
  projectId: string | string[],
  modelId?: string,
) => {
  if (Array.isArray(projectId)) {
    await migrateProjectQueue.addBulk(
      projectId.map((id) => ({ data: { projectId: id, modelId } })),
    );
    return;
  }
  await migrateProjectQueue.add({ projectId, modelId });
};

export default migrateProject;
