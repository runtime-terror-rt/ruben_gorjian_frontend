const fs = require('fs');
const file = 'app/admin/enterprise-plan/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// We need to re-add getPaginationRowModel import if missing, but it's probably still there.
// We'll replace the table definition to use client-side pagination correctly.

content = content.replace(/const table = useReactTable\(\{[\s\S]*?getCoreRowModel: getCoreRowModel\(\),[\s\S]*?\}\);/, `const table = useReactTable({
    data: invitesQuery.data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });`);

// Update AdminPagination to use table's state instead of the backend's state,
// since we suspect the backend might not be paginating properly or we want React Table to handle it.
// Actually, if we just do this, React Table will manage pageIndex internally.
// We need AdminPagination to read from React Table.

content = content.replace(/<AdminPagination[\s\S]*?\/>/, `<AdminPagination
            currentPage={table.getState().pagination.pageIndex + 1}
            totalPages={table.getPageCount()}
            totalItems={invitesQuery.data?.items?.length ?? 0}
            onPageChange={(p) => table.setPageIndex(p - 1)}
          />`);

fs.writeFileSync(file, content);
console.log('Pagination fixed.');
