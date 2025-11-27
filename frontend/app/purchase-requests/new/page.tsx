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
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Product, Warehouse } from "@/types";

interface FormItem {
  product_id: string;
  quantity: number;
}

export default function NewPurchaseRequestPage() {
  const router = useRouter();
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
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [productsRes] = await Promise.all([
        api.getProducts({ limit: 100 }),
      ]);

      if (productsRes.status === "success" && productsRes.data) {
        setProducts(productsRes.data);
      }

      // Hardcode warehouses for now (backend doesn't have warehouse endpoint)
      setWarehouses([
        { id: 1, name: "Central Warehouse Jakarta" },
        { id: 2, name: "Branch Warehouse Surabaya" },
        { id: 3, name: "Branch Warehouse Bandung" },
      ]);
    } catch {
      setError("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

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

    // Validation
    if (!warehouseId) {
      setError("Please select a warehouse");
      return;
    }

    const validItems = items.filter(
      (item) => item.product_id && item.quantity > 0
    );
    if (validItems.length === 0) {
      setError("Please add at least one item with valid product and quantity");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        warehouse_id: parseInt(warehouseId),
        items: validItems.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: item.quantity,
        })),
      };

      await api.createPurchaseRequest(payload);
      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push("/purchase-requests");
      }, 1500);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      setError(
        error.response?.data?.message || "Failed to create purchase request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
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
        Create Purchase Request
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Fill in the details below to create a new purchase request
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Purchase Request created successfully! Redirecting...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 4, overflow: "visible" }}>
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
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4, overflow: "visible" }}>
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
              <Box key={index}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { sm: "flex-start" },
                    bgcolor: "grey.50",
                    p: 2,
                    borderRadius: 1,
                    mb: 2,
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
                        {products.map((product) => (
                          <MenuItem key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ width: { xs: "100%", sm: "120px" } }}>
                    <TextField
                      fullWidth
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
                  </Box>
                  <Box sx={{ pt: 0.5 }}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length === 1}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
            startIcon={<SaveIcon />}
          >
            {submitting ? "Creating..." : "Create Request"}
          </Button>
        </Box>
      </form>
    </Container>
  );
}
