const fs = require('fs');
const path = require('path');

const entities = ['booking', 'class', 'product', 'service', 'therapist', 'message', 'payment'];

const getRepoContent = (name, Title) => `import { prisma } from '../database/prisma';
import { Prisma } from '@prisma/client';

export class ${Title}Repository {
  async findMany(where?: any) {
    return (prisma as any).${name}.findMany({ where });
  }

  async findById(id: string) {
    return (prisma as any).${name}.findUnique({ where: { id } });
  }

  async create(data: any) {
    return (prisma as any).${name}.create({ data });
  }

  async update(id: string, data: any) {
    return (prisma as any).${name}.update({ where: { id }, data });
  }
  
  async delete(id: string) {
    return (prisma as any).${name}.delete({ where: { id } });
  }
}

export const ${name}Repository = new ${Title}Repository();
`;

const getServiceContent = (name, Title) => `import { ${name}Repository } from '../repositories/${name}.repository';

export class ${Title}Service {
  async getAll(filters?: any) {
    return ${name}Repository.findMany(filters);
  }

  async getById(id: string) {
    const item = await ${name}Repository.findById(id);
    if (!item) throw new Error('${Title} not found');
    return item;
  }

  async create(data: any) {
    return ${name}Repository.create(data);
  }

  async update(id: string, data: any) {
    return ${name}Repository.update(id, data);
  }
  
  async delete(id: string) {
    return ${name}Repository.delete(id);
  }
}

export const ${name}Service = new ${Title}Service();
`;

const getControllerContent = (name, Title) => `import { Request, Response, NextFunction } from 'express';
import { ${name}Service } from '../services/${name}.service';

export class ${Title}Controller {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await ${name}Service.getAll(req.query);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await ${name}Service.getById(req.params.id as string);
      res.json(item);
    } catch (err: any) {
      if (err.message === '${Title} not found') return res.status(404).json({ error: err.message });
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await ${name}Service.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await ${name}Service.update(req.params.id as string, req.body);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
  
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ${name}Service.delete(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const ${name}Controller = new ${Title}Controller();
`;

const getRouteContent = (name, Title) => `import { Router } from 'express';
import { ${name}Controller } from '../controllers/${name}.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.get('/', ${name}Controller.getAll);
router.get('/:id', ${name}Controller.getById);
router.post('/', requireAuth, ${name}Controller.create);
router.put('/:id', requireAuth, ${name}Controller.update);
router.delete('/:id', requireAuth, ${name}Controller.delete);

export default router;
`;

const srcDir = path.join(__dirname, 'src');

entities.forEach(entity => {
  const Title = entity.charAt(0).toUpperCase() + entity.slice(1);
  const routeName = entity === 'class' ? 'classes' : (entity === 'message' ? 'messages' : (entity === 'payment' ? 'payment' : entity + 's'));
  
  fs.writeFileSync(path.join(srcDir, 'repositories/' + entity + '.repository.ts'), getRepoContent(entity, Title));
  fs.writeFileSync(path.join(srcDir, 'services/' + entity + '.service.ts'), getServiceContent(entity, Title));
  fs.writeFileSync(path.join(srcDir, 'controllers/' + entity + '.controller.ts'), getControllerContent(entity, Title));
  
  // Overwrite the existing route file if it exists, or create new
  fs.writeFileSync(path.join(srcDir, 'routes/' + routeName + '.ts'), getRouteContent(entity, Title));
});

console.log('Generated boilerplate for:', entities.join(', '));
