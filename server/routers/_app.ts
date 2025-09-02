import { router, procedure } from "../trpc"

export const appRouter = router({
    hello: procedure.query(() => {
        return { message: 'Hello from trpc' }
    }),

    greet: procedure.input((name: unknown) => {
        if (typeof name === 'string') return name;
      throw new Error('Name must be a string');
    }).query(( input ) => {
        return { message: 'Hello ' + input  }
    })
})

export type AppRouter = typeof appRouter 