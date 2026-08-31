import { prisma, type ChallengeDifficulty } from "@backbench/db";

type FindAllFilters = {
  difficulty?: ChallengeDifficulty;
  category?: string;
  tag?: string;
};

export const challengesRepository = {
  findAll(filters: FindAllFilters) {
    return prisma.challenge.findMany({
      where: {
        ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.tag
          ? {
              tags: {
                some: {
                  tag: {
                    name: filters.tag,
                  },
                },
              },
            }
          : {}),
      },
      orderBy: [{ orderIndex: "asc" }, { title: "asc" }],
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  },

  findBySlug(slug: string) {
    return prisma.challenge.findUnique({
      where: { slug },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  },
};
