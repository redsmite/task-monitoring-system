import { router } from "@inertiajs/react";
import {
    Pagination as PaginationRoot,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

export default function Pagination({ links = [], current_page = 1, per_page = 7, total = 0, last_page = 1, tableType = '' }) {
    if (!links || links.length === 0) {
        return null;
    }

    // Calculate showing range
    const from = total > 0 ? ((current_page - 1) * per_page) + 1 : 0;
    const to = Math.min(current_page * per_page, total);

    // Map table types to their page parameter names
    const pageParamMap = {
        'not_started': 'not_started_page',
        'in_progress': 'in_progress_page',
        'completed': 'completed_page',
    };

    const pageParam = pageParamMap[tableType] || 'page';

    // Extract page numbers from links (excluding Previous/Next)
    const getPageNumber = (link) => {
        if (!link.url) return null;
        try {
            const urlObj = new URL(link.url, window.location.origin);
            // Try table-specific param first, then generic page param
            const page = urlObj.searchParams.get(pageParam) || urlObj.searchParams.get('page');
            return page ? parseInt(page) : null;
        } catch {
            // Fallback: try to extract from label if it's a number
            if (link.label && typeof link.label === 'string') {
                const pageMatch = link.label.match(/\d+/);
                if (pageMatch) {
                    return parseInt(pageMatch[0]);
                }
            }
            return null;
        }
    };

    // Build smart pagination with ellipsis
    const buildPaginationLinks = () => {
        const paginationLinks = [];

        // Always add Previous button (first link)
        if (links[0]) {
            paginationLinks.push({ type: 'previous', ...links[0] });
        }

        // If 3 or fewer pages, show all
        if (last_page <= 3) {
            for (let i = 1; i <= last_page; i++) {
                const link = links.find(l => {
                    const pageNum = getPageNumber(l);
                    return pageNum === i;
                });
                if (link) {
                    paginationLinks.push({ type: 'page', page: i, ...link });
                }
            }
        } else {
            // More than 3 pages - use ellipsis logic
            // Always show page 1
            const page1Link = links.find(l => {
                const pageNum = getPageNumber(l);
                return pageNum === 1;
            });
            if (page1Link) {
                paginationLinks.push({ type: 'page', page: 1, ...page1Link });
            }

            // Show ellipsis if current page is far from start
            if (current_page > 3) {
                paginationLinks.push({ type: 'ellipsis' });
            }

            // Show pages around current page
            const startPage = Math.max(2, current_page - 1);
            const endPage = Math.min(last_page - 1, current_page + 1);

            for (let i = startPage; i <= endPage; i++) {
                // Skip if already added (page 1) or will be added (last page)
                if (i === 1 || i === last_page) continue;

                const link = links.find(l => {
                    const pageNum = getPageNumber(l);
                    return pageNum === i;
                });
                if (link) {
                    paginationLinks.push({ type: 'page', page: i, ...link });
                }
            }

            // Show ellipsis if current page is far from end
            if (current_page < last_page - 2) {
                paginationLinks.push({ type: 'ellipsis' });
            }

            // Always show last page
            if (last_page > 1) {
                const lastPageLink = links.find(l => {
                    const pageNum = getPageNumber(l);
                    return pageNum === last_page;
                });
                if (lastPageLink) {
                    paginationLinks.push({ type: 'page', page: last_page, ...lastPageLink });
                }
            }
        }

        // Always add Next button (last link)
        if (links[links.length - 1]) {
            paginationLinks.push({ type: 'next', ...links[links.length - 1] });
        }

        return paginationLinks;
    };

    const paginationLinks = buildPaginationLinks();

    const handlePageClick = (url) => {
        if (!url) return;

        try {
            const urlObj = new URL(url, window.location.origin);

            // Extract target URL params
            let params = Object.fromEntries(urlObj.searchParams);
            
            // Extract current browser params
            let currentParams = Object.fromEntries(
                new URLSearchParams(window.location.search)
            );

            // Convert Laravel pagination ?page=2 → ?not_started_page=2
            if (params.page && pageParam) {
                params = {
                    ...params,
                    [pageParam]: params.page
                };
                delete params.page;
            }

            // Merge: currentParams → params  
            // but override only the specific page param for this table
            const finalParams = {
                ...currentParams,
                ...params,
            };

            // Remove generic default page param if it exists
            delete finalParams.page;

            router.get(urlObj.pathname, finalParams, {
                preserveState: true,
                preserveScroll: true,
            });
        } catch (err) {
            router.get(url, {}, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <PaginationRoot>
            <div className="flex items-center w-full justify-end">
                <PaginationContent>
                    {paginationLinks.map((item, index) => {
                        if (item.type === 'previous') {
                            return (
                                <PaginationItem key={`prev-${index}`}>
                                    <PaginationPrevious
                                        href={item.url || undefined}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (item.url) handlePageClick(item.url);
                                        }}
                                        className={!item.url ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            );
                        }

                        if (item.type === 'next') {
                            return (
                                <PaginationItem key={`next-${index}`}>
                                    <PaginationNext
                                        href={item.url || undefined}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (item.url) handlePageClick(item.url);
                                        }}
                                        className={!item.url ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            );
                        }

                        if (item.type === 'ellipsis') {
                            return (
                                <PaginationItem key={`ellipsis-${index}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }

                        // Regular page numbers
                        return (
                            <PaginationItem key={`page-${item.page}-${index}`}>
                                <PaginationLink
                                    href={item.url || undefined}
                                    isActive={item.active}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (item.url) handlePageClick(item.url);
                                    }}
                                    className={!item.url ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                >
                                    {item.page || item.label}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}
                </PaginationContent>
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Showing <span className="font-semibold">{from}</span> to <span className="font-semibold">{to}</span> of <span className="font-semibold">{total}</span> results
                </div>
            </div>
        </PaginationRoot>
    );
}