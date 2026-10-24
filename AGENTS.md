<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep music discovery in a dedicated component on the presentation page so the original presentation remains intact.
- Music catalog and chart requests run in validated server functions; AI request helpers stay in server-only modules to keep credentials private.
- Use live Apple catalog/chart data for song results and trend rankings rather than AI-invented charts.
