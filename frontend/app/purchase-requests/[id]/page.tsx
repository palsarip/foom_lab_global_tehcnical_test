"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { PurchaseRequest } from "@/types";

export default function PurchaseRequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [pr, setPr] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPurchaseRequest();
  }, []);

  const fetchPurchaseRequest = async () => {
    try {
      setLoading(true);
      const response: any = await api.getPurchaseRequest(id);

      if (response.status === "success" && response.data) {
        setPr(response.data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch purchase request details"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "PENDING":
        return "warning";
      case "COMPLETED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !pr) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || "Purchase Request not found"}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          Back to List
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        Back to List
      </Button>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {pr.reference}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Created on {new Date(pr.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
        <Chip
          label={pr.status}
          color={getStatusColor(pr.status)}
          sx={{ fontWeight: "bold", fontSize: "1rem", px: 2, py: 2.5 }}
        />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Warehouse Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">
                <strong>Name:</strong> {pr.Warehouse?.name || "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Vendor Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">
                <strong>Name:</strong> {pr.vendor || "PT FOOM LAB GLOBAL"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
        Items
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell>
                <strong>Product Name</strong>
              </TableCell>
              <TableCell>
                <strong>SKU</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Quantity</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pr.PurchaseRequestItems?.map((item: any) => (
              <TableRow key={item.id} hover>
                <TableCell>{item.Product?.name || "Unknown Product"}</TableCell>
                <TableCell>{item.Product?.sku || "-"}</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {item.quantity}
                </TableCell>
              </TableRow>
            ))}
            {(!pr.PurchaseRequestItems ||
              pr.PurchaseRequestItems.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{ py: 4, color: "text.secondary" }}
                >
                  No items found in this request
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
