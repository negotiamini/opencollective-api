import express from 'express';
import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';

import { MemberRole } from '../enum/MemberRole';
import { getIdEncodeResolver, IDENTIFIER_TYPES } from '../identifiers';
import { Account } from '../interface/Account';

import { Individual } from './Individual';
import { Tier } from './Tier';

export const MemberInvitation = new GraphQLObjectType({
  name: 'MemberInvitation',
  description: 'An invitation to join the members of a collective',
  fields: () => {
    return {
      id: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: getIdEncodeResolver(IDENTIFIER_TYPES.MEMBER_INVITATION),
      },
      inviter: {
        type: Individual,
        description: 'The person who invited the member, if any',
        resolve: async (member, _, req: express.Request): Promise<Record<string, unknown>> => {
          const collective = await req.loaders.Collective.byUserId.load(member.CreatedByUserId);
          if (!collective?.isIncognito) {
            return collective;
          }
        },
      },
      createdAt: {
        type: new GraphQLNonNull(GraphQLDateTime),
        resolve(member) {
          return member.createdAt;
        },
      },
      account: {
        type: new GraphQLNonNull(Account),
        resolve(member, args, req) {
          return req.loaders.Collective.byId.load(member.CollectiveId);
        },
      },
      memberAccount: {
        type: new GraphQLNonNull(Account),
        resolve(member, args, req) {
          return req.loaders.Collective.byId.load(member.MemberCollectiveId);
        },
      },
      role: {
        type: new GraphQLNonNull(MemberRole),
        resolve(member) {
          return member.role;
        },
      },
      description: {
        type: GraphQLString,
        resolve(member) {
          return member.description;
        },
      },
      tier: {
        type: Tier,
        resolve(member, args, req) {
          return member.TierId && req.loaders.Tier.byId.load(member.TierId);
        },
      },
      since: {
        type: GraphQLDateTime,
        resolve(member) {
          return member.since;
        },
      },
    };
  },
});