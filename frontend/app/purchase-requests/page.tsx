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
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  TableSortLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { api } from "@/lib/api";
import { PurchaseRequest, ApiResponse } from "@/types";

type Order = "asc" | "desc";

export default function PurchaseRequestsPage() {
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Drafts State
  const [searchDrafts, setSearchDrafts] = useState("");
  const [draftOrder, setDraftOrder] = useState<Order>("desc");
  const [draftOrderBy, setDraftOrderBy] =
    useState<keyof PurchaseRequest>("createdAt");

  // History State
  const [searchHistory, setSearchHistory] = useState("");
  const [historyOrder, setHistoryOrder] = useState<Order>("desc");
  const [historyOrderBy, setHistoryOrderBy] =
    useState<keyof PurchaseRequest>("createdAt");

  useEffect(() => {
    fetchPurchaseRequests();
  }, []);

  const fetchPurchaseRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const response = (await api.getPurchaseRequests()) as ApiResponse<
        PurchaseRequest[]
      >;

      if (response.status === "success" && response.data) {
        setPurchaseRequests(response.data);
      }
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      setError(
        error.response?.data?.message || "Failed to fetch purchase requests"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDraftSort = (property: keyof PurchaseRequest) => {
    const isAsc = draftOrderBy === property && draftOrder === "asc";
    setDraftOrder(isAsc ? "desc" : "asc");
    setDraftOrderBy(property);
  };

  const handleHistorySort = (property: keyof PurchaseRequest) => {
    const isAsc = historyOrderBy === property && historyOrder === "asc";
    setHistoryOrder(isAsc ? "desc" : "asc");
    setHistoryOrderBy(property);
  };

  const handleProceed = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to proceed with this request? It will be sent for approval."
      )
    )
      return;

    try {
      setProcessingId(id);
      await api.updatePurchaseRequest(id, { status: "PENDING" });
      await fetchPurchaseRequests();
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      alert(error.response?.data?.message || "Failed to process request");
    } finally {
      setProcessingId(null);
    }
  };

  const processRequests = (
    requests: PurchaseRequest[],
    search: string,
    order: Order,
    orderBy: keyof PurchaseRequest
  ) => {
    const filtered = requests.filter((pr) => {
      const searchLower = search.toLowerCase();
      return (
        pr.reference.toLowerCase().includes(searchLower) ||
        (pr.vendor || "").toLowerCase().includes(searchLower)
      );
    });

    return filtered.sort((a, b) => {
      const isAsc = order === "asc";
      if (orderBy === "createdAt") {
        return isAsc
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((b[orderBy] as any) < (a[orderBy] as any)) {
        return isAsc ? 1 : -1;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((b[orderBy] as any) > (a[orderBy] as any)) {
        return isAsc ? -1 : 1;
      }
      return 0;
    });
  };

  const drafts = processRequests(
    purchaseRequests.filter((pr) => pr.status === "DRAFT"),
    searchDrafts,
    draftOrder,
    draftOrderBy
  );

  const history = processRequests(
    purchaseRequests.filter((pr) => pr.status !== "DRAFT"),
    searchHistory,
    historyOrder,
    historyOrderBy
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Purchase Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your procurement requests
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          href="/purchase-requests/new"
          size="large"
        >
          Create New
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Drafts Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              mt: 4,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Draft Requests
            </Typography>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search Drafts..."
              value={searchDrafts}
              onChange={(e) => setSearchDrafts(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250, bgcolor: "background.paper" }}
            />
          </Box>

          {drafts.length === 0 && !searchDrafts ? (
            <Paper
              sx={{ p: 4, textAlign: "center", bgcolor: "grey.50", mb: 4 }}
            >
              <Typography color="text.secondary">
                No draft requests found
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={draftOrderBy === "reference"}
                        direction={
                          draftOrderBy === "reference" ? draftOrder : "asc"
                        }
                        onClick={() => handleDraftSort("reference")}
                      >
                        <strong>Reference</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={draftOrderBy === "vendor"}
                        direction={
                          draftOrderBy === "vendor" ? draftOrder : "asc"
                        }
                        onClick={() => handleDraftSort("vendor")}
                      >
                        <strong>Vendor</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={draftOrderBy === "qty_total"}
                        direction={
                          draftOrderBy === "qty_total" ? draftOrder : "asc"
                        }
                        onClick={() => handleDraftSort("qty_total")}
                      >
                        <strong>Qty</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={draftOrderBy === "createdAt"}
                        direction={
                          draftOrderBy === "createdAt" ? draftOrder : "asc"
                        }
                        onClick={() => handleDraftSort("createdAt")}
                      >
                        <strong>Created Date</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Actions</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Process</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drafts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No drafts found matching &quot;{searchDrafts}&quot;
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    drafts.map((pr) => (
                      <TableRow key={pr.id} hover>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {pr.reference}
                        </TableCell>
                        <TableCell>
                          {pr.vendor || "PT FOOM LAB GLOBAL"}
                        </TableCell>
                        <TableCell>{pr.qty_total || 0}</TableCell>
                        <TableCell>
                          {new Date(pr.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              component={Link}
                              href={`/purchase-requests/${pr.id}`}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="info"
                              component={Link}
                              href={`/purchase-requests/${pr.id}/edit`}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            onClick={() => handleProceed(pr.id)}
                            disabled={processingId === pr.id}
                          >
                            {processingId === pr.id
                              ? "Processing..."
                              : "Proceed"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* History Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Request History
            </Typography>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search History..."
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250, bgcolor: "background.paper" }}
            />
          </Box>

          {history.length === 0 && !searchHistory ? (
            <Paper sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
              <Typography color="text.secondary">
                No request history found
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={historyOrderBy === "reference"}
                        direction={
                          historyOrderBy === "reference" ? historyOrder : "asc"
                        }
                        onClick={() => handleHistorySort("reference")}
                      >
                        <strong>Reference</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={historyOrderBy === "vendor"}
                        direction={
                          historyOrderBy === "vendor" ? historyOrder : "asc"
                        }
                        onClick={() => handleHistorySort("vendor")}
                      >
                        <strong>Vendor</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={historyOrderBy === "qty_total"}
                        direction={
                          historyOrderBy === "qty_total" ? historyOrder : "asc"
                        }
                        onClick={() => handleHistorySort("qty_total")}
                      >
                        <strong>Qty</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={historyOrderBy === "status"}
                        direction={
                          historyOrderBy === "status" ? historyOrder : "asc"
                        }
                        onClick={() => handleHistorySort("status")}
                      >
                        <strong>Status</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={historyOrderBy === "createdAt"}
                        direction={
                          historyOrderBy === "createdAt" ? historyOrder : "asc"
                        }
                        onClick={() => handleHistorySort("createdAt")}
                      >
                        <strong>Request Date</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No history found matching &quot;{searchHistory}&quot;
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((pr) => (
                      <TableRow key={pr.id} hover>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          {pr.reference}
                        </TableCell>
                        <TableCell>
                          {pr.vendor || "PT FOOM LAB GLOBAL"}
                        </TableCell>
                        <TableCell>{pr.qty_total || 0}</TableCell>
                        <TableCell>
                          <Chip
                            label={pr.status}
                            color={
                              pr.status === "COMPLETED"
                                ? "success"
                                : pr.status === "REJECTED"
                                ? "error"
                                : "warning"
                            }
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(pr.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              component={Link}
                              href={`/purchase-requests/${pr.id}`}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Container>
  );
}
