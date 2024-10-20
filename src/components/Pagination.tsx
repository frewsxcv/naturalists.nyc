import React from "react";
import { default as BootstrapPagination } from "react-bootstrap/Pagination";

type PaginationProps = {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (pageNumber: number) => void;
};

const Pagination = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
}: PaginationProps) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageLimit = 5; // Set the limit of pages to display
    const startPage = Math.max(1, currentPage - Math.floor(pageLimit / 2));
    const endPage = Math.min(totalPages, startPage + pageLimit - 1);

    return (
        <div className="d-flex justify-content-center">
            <BootstrapPagination className="m-0">
                <BootstrapPagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                />
                {[...Array(endPage - startPage + 1).keys()].map((number) => (
                    <BootstrapPagination.Item
                        key={startPage + number}
                        active={startPage + number === currentPage}
                        onClick={() => onPageChange(startPage + number)}
                    >
                        {startPage + number}
                    </BootstrapPagination.Item>
                ))}
                <BootstrapPagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                />
            </BootstrapPagination>
        </div>
    );
};

export default Pagination;
