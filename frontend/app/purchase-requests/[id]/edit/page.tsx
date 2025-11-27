"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Product, Warehouse, PurchaseRequestItem } from "@/types";

interface FormItem {
  product_id: string;
  quantity: number;
}

export default function EditPurchaseRequestPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [warehouseId, setWarehouseId] = useState("");
  const [items, setItems] = useState<FormItem[]>([
    { product_id: "", quantity: 1 },
  ]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const [prRes, productsRes] = await Promise.all([
          api.getPurchaseRequest(id),
          api.getProducts({ limit: 100 }),
        ]);

        if (prRes.status === "success" && prRes.data) {
          const pr = prRes.data;
          setWarehouseId(pr.warehouse_id.toString());

          if (pr.PurchaseRequestItems && pr.PurchaseRequestItems.length > 0) {
            setItems(
              pr.PurchaseRequestItems.map((item: PurchaseRequestItem) => ({
                product_id: item.product_id.toString(),
                quantity: item.quantity,
              }))
            );
          }
        }

        if (productsRes.status === "success" && productsRes.data) {
          setProducts(productsRes.data);
        }

        // Hardcoded warehouses as there is no GET /warehouses endpoint yet
        setWarehouses([
          { id: 1, name: "Central Warehouse Jakarta" },
          { id: 2, name: "Branch Warehouse Surabaya" },
          { id: 3, name: "Branch Warehouse Bandung" },
        ]);
      } catch (err) {
        console.error(err);
        setError("Failed to load purchase request data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  const handleAddItem = () => {
    setItems([...items, { product_id: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof FormItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      setSubmitting(true);
      // Mock update
      // await api.updatePurchaseRequest(id, payload);

      setSuccess(true);
      setTimeout(() => {
        router.push("/purchase-requests");
      }, 1500);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      setError(
        error.response?.data?.message || "Failed to update purchase request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        Back to List
      </Button>

      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Edit Purchase Request
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Purchase Request updated successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              fontWeight="bold"
              sx={{ mb: 3 }}
            >
              Warehouse Details
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Warehouse</InputLabel>
              <Select
                value={warehouseId}
                label="Select Warehouse"
                onChange={(e) => setWarehouseId(e.target.value)}
                required
              >
                {warehouses.map((w) => (
                  <MenuItem key={w.id} value={w.id}>
                    {w.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Items
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                variant="outlined"
                size="small"
              >
                Add Item
              </Button>
            </Box>

            {items.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 2,
                  alignItems: "flex-start",
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Product</InputLabel>
                    <Select
                      value={item.product_id}
                      label="Product"
                      onChange={(e) =>
                        handleItemChange(index, "product_id", e.target.value)
                      }
                      required
                    >
                      {products.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <TextField
                  sx={{ width: 100 }}
                  size="small"
                  type="number"
                  label="Qty"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "quantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  inputProps={{ min: 1 }}
                  required
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length === 1}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={<SaveIcon />}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </form>
    </Container>
  );
}
