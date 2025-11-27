"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Chip,
  TableSortLabel,
} from "@mui/material";
import {
  Search as SearchIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { Stock, ApiResponse } from "@/types";

export default function Dashboard() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState<"ASC" | "DESC">("ASC");

  useEffect(() => {
    fetchStocks();
  }, [page, rowsPerPage, search, sortBy, order]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError("");
      const response: ApiResponse<Stock[]> = await api.getStocks(
        page + 1,
        rowsPerPage,
        search || undefined,
        sortBy,
        order
      );

      if (response.status === "success" && response.data) {
        setStocks(response.data);
        setTotal(response.meta?.total || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch stocks");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleSort = (property: string) => {
    const isAsc = sortBy === property && order === "ASC";
    setOrder(isAsc ? "DESC" : "ASC");
    setSortBy(property);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of inventory levels across all warehouses
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: "primary.main", color: "white" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="overline" sx={{ opacity: 0.8 }}>
                    Total Items
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {total}
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Warehouses
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    3
                  </Typography>
                </Box>
                <WarehouseIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Inventory List
          </Typography>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search products..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer
              sx={{
                border: "1px solid rgba(224, 224, 224, 1)",
                borderRadius: 1,
              }}
            >
              <Table>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === "product_name"}
                        direction={
                          sortBy === "product_name"
                            ? (order.toLowerCase() as "asc" | "desc")
                            : "asc"
                        }
                        onClick={() => handleSort("product_name")}
                      >
                        <strong>Product Name</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <strong>SKU</strong>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === "warehouse_name"}
                        direction={
                          sortBy === "warehouse_name"
                            ? (order.toLowerCase() as "asc" | "desc")
                            : "asc"
                        }
                        onClick={() => handleSort("warehouse_name")}
                      >
                        <strong>Warehouse</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortBy === "quantity"}
                        direction={
                          sortBy === "quantity"
                            ? (order.toLowerCase() as "asc" | "desc")
                            : "asc"
                        }
                        onClick={() => handleSort("quantity")}
                      >
                        <strong>Quantity</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Status</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">
                          No stocks found matching your criteria
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    stocks.map((stock) => (
                      <TableRow key={stock.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {stock.Product.name}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={stock.Product.sku}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{stock.Warehouse.name}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          {stock.quantity}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              stock.quantity > 10
                                ? "In Stock"
                                : stock.quantity > 0
                                ? "Low Stock"
                                : "Out of Stock"
                            }
                            color={
                              stock.quantity > 10
                                ? "success"
                                : stock.quantity > 0
                                ? "warning"
                                : "error"
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Container>
  );
}
