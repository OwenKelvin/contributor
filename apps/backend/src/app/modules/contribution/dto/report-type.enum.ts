import { registerEnumType } from '@nestjs/graphql';

export enum ReportType {
  SUMMARY = 'SUMMARY',
  BY_PROJECT = 'BY_PROJECT',
  BY_USER = 'BY_USER',
  TIME_SERIES = 'TIME_SERIES',
}

registerEnumType(ReportType, {
  name: 'ReportType',
  description: 'Type of contribution report to generate',
});
