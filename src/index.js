import { Application, Router } from "https://deno.land/x/oak/mod.ts";
const books = new Map();
books.set("1", {
    id: "1",
    title: "The Hound of the Baskervilles",
    author: "Conan Doyle, Author"
});
const router = new Router();
router
    .get("/", context => {
    context.response.body = "Hello world!";
})
    .get("/book", context => {
    context.response.body = Array.from(books.values());
})
    .get("/book/:id", context => {
    if (context.params && books.has(context.params.id)) {
        context.response.body = books.get(context.params.id);
    }
});
const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());
app.use((ctx) => {
    ctx.response.body = "Hello world! yasin";
    console.log(ctx);
});
// Logger
app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.headers.get("X-Response-Time");
    console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});
// Timing
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});
app.addEventListener("error", (evt) => {
    // Will log the thrown error to the console.
    console.log(evt.error);
});
await app.listen({ port: 8000 });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUcsV0FBVyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3RFLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUFlLENBQUM7QUFDckMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7SUFDWCxFQUFFLEVBQUUsR0FBRztJQUNQLEtBQUssRUFBRSwrQkFBK0I7SUFDdEMsTUFBTSxFQUFFLHFCQUFxQjtDQUNoQyxDQUFDLENBQUM7QUFFSCxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO0FBQzVCLE1BQU07S0FDRCxHQUFHLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0lBQ2hCLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLGNBQWMsQ0FBQztBQUMzQyxDQUFDLENBQUM7S0FDRCxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0lBQ3BCLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDdkQsQ0FBQyxDQUFDO0tBQ0QsR0FBRyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsRUFBRTtJQUN4QixJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ2hELE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUN4RDtBQUNMLENBQUMsQ0FBQyxDQUFDO0FBRVAsTUFBTSxHQUFHLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztBQUM5QixHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQ3pCLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDakMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBQ1osR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsb0JBQW9CLENBQUM7SUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQztBQUNILFNBQVM7QUFDVCxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDeEIsTUFBTSxJQUFJLEVBQUUsQ0FBQztJQUNiLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3BFLENBQUMsQ0FBQyxDQUFDO0FBRUgsU0FBUztBQUNULEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUN4QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDekIsTUFBTSxJQUFJLEVBQUUsQ0FBQztJQUNiLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUM7SUFDOUIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzRCxDQUFDLENBQUMsQ0FBQztBQUVILEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUNsQyw0Q0FBNEM7SUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyJ9