export type ConsistencyLevel = 'Strong' | 'Bounded' | 'Session' | 'Eventual';

export type OfferType = 'S1' | 'S2' | 'S3';

export type IndexingDirective = 'Include' | 'Exclude';

export type IndexingMode = 'none' | 'consistent' | 'lazy'; // lazy is deemphasized https://github.com/MicrosoftDocs/azure-docs/issues/23875

export interface Resource {
  id: string;
}

export interface PersistedResource extends Resource {
  _rid: string;
  _self: string;
  _etag: string;
  _ts: number;
}

export interface PartitionKeyRange extends PersistedResource {
  id: string;
  minInclusive: string;
  maxExclusive: string;
  ridPrefix: number;
  throughputFraction: number;
  status: string;
  parents: unknown[];
}

export type PartitionKeyRanges = {
  _rid: string;
  PartitionKeyRanges: PartitionKeyRange[];
  _count: number;
};

export interface Document extends PersistedResource {
  _attachments: 'attachments/';
}

export interface Database extends PersistedResource {
  _colls: 'colls/';
  _users: 'users/';
}

export interface IndexingPolicy {
  indexingMode: IndexingMode;
  automatic: boolean;
  includedPaths?: {
    path: string;
    indexes?: {
      dataType: 'String' | 'Number';
      precision: number;
      kind: 'Range' | 'Hash';
    }[];
  }[];
  excludedPaths?: { path: string }[];
}

export interface PartitionKeyDefinition {
  paths: string[];
  kind: 'Hash';
}

export interface ConflictResolutionPolicy {
  mode: 'LastWriterWins';
  conflictResolutionPath: '/_ts';
  conflictResolutionProcedure: '';
}

export interface GeospatialConfig {
  type: 'Geography';
}

export interface Collection extends PersistedResource {
  indexingPolicy: IndexingPolicy;
  partitionKey: PartitionKeyDefinition;
  conflictResolutionPolicy: ConflictResolutionPolicy;
  geospatialConfig: GeospatialConfig;
  _docs: 'docs/';
  _sprocs: 'sprocs/';
  _triggers: 'triggers/';
  _udfs: 'udfs/';
  _conflicts: 'conflicts/';
}
