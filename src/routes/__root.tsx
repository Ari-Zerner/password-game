import {
  Outlet,
  createRootRoute,
} from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen">
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}