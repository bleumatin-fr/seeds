import express from 'express';

import { getReportResults, ProjectUser } from '@arviva/core';
import { HttpError } from '../middlewares/errorHandler';
import Project from '../projects/model';
import { Role } from '../users/model';
import Report from './model';

const router = express.Router();

router.get('/', async (request, response) => {
  const reports = await Report.find({
    users: { $elemMatch: { id: request.user._id } },
  }).lean();
  response.json(reports);
});

router.get('/:id', async (request, response) => {
  let foundReport;
  if (request.params.id === 'latest') {
    // when asking for latest report...

    // - we're checking the latest report config
    foundReport = await Report.findOne({
      users: { $elemMatch: { id: request.user._id } },
    })
      .sort({ createdAt: -1 })
      .populate('users.user');

    if (!foundReport) {
      throw new HttpError(404, 'Not found');
    }

    // - then we're regenerating the report results from
    //  the latest project results
    const projects = await Project.find({
      _id: { $in: foundReport?.projects.map((p) => p._id) },
    }).lean();
    foundReport.results = getReportResults(
      projects,
      foundReport.projectCoefficients,
    );
  } else {
    foundReport = await Report.findOne({ _id: request.params.id }).populate(
      'users.user',
    );
  }
  if (!foundReport) {
    throw new HttpError(404, 'Not found');
  }
  if (
    !foundReport.users.some((user) => user.id.equals(request.user._id)) &&
    request.user.role !== Role.ADMIN
  ) {
    throw new HttpError(403, 'Forbidden');
  }
  response.json(foundReport);
});

router.post('/', async (request, response) => {
  const {
    projects: projectCoefficients,
    startDate,
    endDate,
    name,
  }: {
    projects: {
      id: string;
      value?: number;
    }[];
    name: string;
    startDate: Date;
    endDate: Date;
  } = request.body;

  const projectIds = projectCoefficients.map((p) => p.id);

  const projects = await Project.find({ _id: { $in: projectIds } }).lean();

  const results = getReportResults(projects, projectCoefficients);

  const users: ProjectUser[] = [
    {
      id: request.user._id,
      role: 'owner',
      user: request.user,
    },
  ];

  const report = await Report.create({
    name,
    startDate,
    endDate,
    users,
    projects,
    projectCoefficients,
    results,
  });

  response.json(report);
});

router.patch('/:id', async (request, response) => {
  const { name }: { name: string } = request.body;
  const reportId = request.params.id;
  const foundReport = await Report.findById(reportId);
  if (!foundReport) {
    throw new HttpError(404, 'Not found');
  }
  if (!foundReport.users.some((user) => user.id.equals(request.user._id))) {
    throw new HttpError(403, 'Forbidden');
  }

  foundReport.name = name;
  await foundReport.save();

  response.json(foundReport);
});

router.delete('/:id', async (request, response) => {
  const reportId = request.params.id;
  const foundReport = await Report.findById(reportId);
  if (!foundReport) {
    throw new HttpError(404, 'Not found');
  }
  if (!foundReport.users.some((user) => user.id.equals(request.user._id))) {
    throw new HttpError(403, 'Forbidden');
  }
  await Report.deleteOne({_id: reportId})
  response.json(foundReport);
});

export default router;
