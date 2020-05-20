/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.schema
    .createTable('locations', table => {
      table.comment(
        'Registered locations that shall be contiuously scanned for catalog item updates',
      );
      table.uuid('id').primary().comment('Auto-generated ID of the location');
      table.string('type').notNullable().comment('The type of location');
      table
        .string('target')
        .notNullable()
        .comment('The actual target of the location');
    })
    .createTable('entities', table => {
      table.comment('All entities stored in the system');
      table.uuid('id').primary().comment('Auto-generated ID of the entity');
      table
        .integer('generation')
        .notNullable()
        .comment(
          'Generation number that changes each time the entity is updated',
        );
      table
        .uuid('locationId')
        .references('id')
        .inTable('locations')
        .nullable()
        .comment('The location that originated the component');
      table
        .string('apiVersion')
        .notNullable()
        .comment('The apiVersion field of the entity');
      table
        .string('kind')
        .notNullable()
        .comment('The kind field of the entity');
      table
        .string('name')
        .nullable()
        .comment('The metadata.name field of the entity');
      table
        .string('namespace')
        .nullable()
        .comment('The metadata.namespace field of the entity');
      table
        .string('metadata')
        .nullable()
        .comment('The entire metadata JSON blob of the entity');
      table
        .string('spec')
        .nullable()
        .comment('The entire spec JSON blob of the entity');
    })
    .alterTable('entities', table => {
      // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.18/#objectmeta-v1-meta
      table.unique(['name', 'namespace'], 'entities_unique_name');
    })
    .createTable('entitiesSearch', table => {
      table.comment(
        'Flattened key-values from the entities, used for quick filtering',
      );
      table
        .uuid('entityId')
        .references('id')
        .inTable('entities')
        .onDelete('cascade')
        .comment('The entity that matches this key/value');
      table
        .string('key')
        .notNullable()
        .comment('A key that occurs in the entity');
      table
        .string('value')
        .nullable()
        .comment('The corresponding value to match on');
    });
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema
    .dropTable('entitiesSearch')
    .alterTable('entities', table => {
      table.dropUnique([], 'entities_unique_name');
    })
    .dropTable('entities')
    .dropTable('locations');
}
