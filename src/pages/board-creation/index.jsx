import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import Header from "../../components/ui/Header";
import Footer from "../home/components/Footer";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import WalletConnectionModal from "../../components/wallet/WalletConnectionModal";
import SuccessNotification from "../../components/ui/SuccessNotification";
import ErrorNotification from "../../components/ui/ErrorNotification";
import { ipfsService } from "../../services/ipfsService";
import {
  generateBoardHash,
  validateBoardData,
} from "../../utils/boardUtils";
import {
  createBoard,
  testSupabaseConnection,
} from "../../utils/supabaseApi";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { createFeedbackBoard } from "../../services/anchorService";
import { checkSolBalance, formatSolBalance } from "../../utils/balanceUtils";

const BoardCreationStudio = () => {
  const navigate = useNavigate();

  // Wallet connection
  const { connected, connecting, publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Test Supabase connection on component mount
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  // Check balance when wallet connects
  useEffect(() => {
    const checkBalance = async () => {
      if (connected && publicKey) {
        setBalanceInfo(prev => ({ ...prev, isChecking: true }));
        const result = await checkSolBalance(publicKey);
        setBalanceInfo({
          balance: result.balance,
          hasEnoughBalance: result.hasEnoughBalance,
          isChecking: false,
          error: result.error
        });
      } else {
        setBalanceInfo({
          balance: 0,
          hasEnoughBalance: true,
          isChecking: false,
          error: null
        });
      }
    };

    checkBalance();
  }, [connected, publicKey]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Form data with category
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [createdBoardId, setCreatedBoardId] = useState(null);
  
  // Error notification state
  const [errorNotification, setErrorNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionText: '',
    onAction: null
  });

  // Balance checking state
  const [balanceInfo, setBalanceInfo] = useState({
    balance: 0,
    hasEnoughBalance: true,
    isChecking: false,
    error: null
  });

  // Categories for dropdown with icons
  const categories = [
    {
      value: "product",
      label: "Product Feedback",
      icon: "Package",
      description: "Get feedback on your products and features",
    },
    {
      value: "service",
      label: "Service Feedback",
      icon: "Users",
      description: "Improve your service quality and customer experience",
    },
    {
      value: "website",
      label: "Website Feedback",
      icon: "Globe",
      description: "Enhance your website design and functionality",
    },
    {
      value: "app",
      label: "App Feedback",
      icon: "Smartphone",
      description: "Optimize your mobile or web application",
    },
    {
      value: "event",
      label: "Event Feedback",
      icon: "Calendar",
      description: "Gather insights from event attendees",
    },
    {
      value: "team",
      label: "Team Feedback",
      icon: "Users2",
      description: "Internal feedback for team improvements",
    },
    {
      value: "course",
      label: "Course/Training",
      icon: "BookOpen",
      description: "Educational content and training feedback",
    },
    {
      value: "support",
      label: "Customer Support",
      icon: "Headphones",
      description: "Improve your customer support experience",
    },
    {
      value: "general",
      label: "General Feedback",
      icon: "MessageSquare",
      description: "Open feedback on any topic",
    },
    {
      value: "other",
      label: "Other",
      icon: "MoreHorizontal",
      description: "Custom feedback category",
    },
  ];

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData?.title?.trim()) newErrors.title = "Board title is required";
    if (!formData?.description?.trim())
      newErrors.description = "Description is required";
    if (!formData?.category?.trim())
      newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  // Handle board creation
  const handleCreate = async () => {
    console.log("handleCreate called, connected:", connected);

    if (!connected || !wallet) {
      console.log("Wallet not connected, opening modal");
      setIsWalletModalOpen(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!publicKey) {
      console.error("Public key not available");
      return;
    }

    setIsDeploying(true);

    try {
      // Validate form data first
      const validation = validateBoardData({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        creator: publicKey.toString(),
      });

      if (!validation.isValid) {
        console.error("Validation errors:", validation.errors);
        alert(
          `Please fix the following issues:\n${validation.errors.join("\n")}`
        );
        return;
      }

      // Generate unique board ID using SHA-256 hashing
      const boardId = await generateBoardHash(
        publicKey.toString(),
        formData.title,
        formData.category
      );

      // Prepare board data with complete IPFS structure
      const boardData = {
        board_id: boardId,
        board_title: formData.title,
        board_description: formData.description,
        board_category: formData.category,
        created_by: publicKey.toString(),
        created_at: new Date().toISOString(),
        latest_feedback_by: "",
        latest_feedback_at: "",
        total_feedback_count: 0,
        feedbacks: [],
        // Legacy fields for compatibility
        boardId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        creator: publicKey.toString(),
        createdAt: new Date().toISOString(),
        version: "1.0",
      };

      console.log("Creating board with data:", boardData);

      // Step 1: Upload to IPFS first
      console.log("📁 Uploading to IPFS...");
      const ipfsUploadResult = await ipfsService.uploadBoardToIPFS(boardData);

      if (!ipfsUploadResult.success) {
        throw new Error(`IPFS upload failed: ${ipfsUploadResult.error}`);
      }

      console.log("✅ Board uploaded to IPFS:", ipfsUploadResult);
      const ipfsCid = ipfsUploadResult.cid;
      boardData.ipfsHash = ipfsCid;
      boardData.ipfsUrl = ipfsUploadResult.url;

      // Step 2: Create board on-chain using Anchor (CRITICAL STEP)
      console.log("🔗 Creating board on-chain...");
      let anchorResult = null;
      let blockchainSuccess = false;

      try {
        if (!wallet) {
          throw new Error("Wallet not available for blockchain submission");
        }
        
        anchorResult = await createFeedbackBoard(wallet, boardId, ipfsCid);
        console.log("✅ Board created on-chain successfully:", anchorResult);

        // Add anchor data to board data
        boardData.anchorPda = anchorResult.pda.toString();
        boardData.anchorTx = anchorResult.tx;
        boardData.onChain = true;
        blockchainSuccess = true;
        
      } catch (error) {
        console.error("💥 Blockchain board creation failed:", error);
        console.error("Logs:", error.transactionLogs);

        // CRITICAL: Cleanup IPFS upload since blockchain failed
        if (ipfsUploadResult.cid) {
          console.log("🧹 Cleaning up IPFS upload due to blockchain failure...");
          try {
            await ipfsService.deleteByCID(ipfsUploadResult.cid);
            console.log("✅ IPFS cleanup successful");
          } catch (cleanupError) {
            console.error("❌ IPFS cleanup failed:", cleanupError);
          }
        }
        
        // Re-throw the error to prevent database update
        throw new Error(`Blockchain board creation failed: ${error.message}`);
      }

      // Step 3: Save to database ONLY if blockchain succeeded
      if (blockchainSuccess) {
        console.log("✅ Blockchain successful, saving to database...");
        try {
          const dbPayload = {
            owner: publicKey.toString(),
            board_id: boardId,
            ipfs_cid: ipfsCid,
            anchor_pda: boardData.anchorPda,
            anchor_tx: boardData.anchorTx,
            on_chain: true,
            title: formData.title,
            description: formData.description,
            category: formData.category,
          };

          const dbResult = await createBoard(dbPayload);
          console.log("✅ Board saved to database:", dbResult);
          boardData.dbId = dbResult.id;
        } catch (dbError) {
          console.error("💥 Database save failed:", dbError);
          // Even if database fails, we don't cleanup since blockchain succeeded
          // This is a recoverable state - the board exists on-chain and IPFS
          console.warn("Board created on blockchain and IPFS but database save failed");
        }
      } else {
        throw new Error("Blockchain submission failed, board creation aborted");
      }

      console.log("Board creation completed:", boardData);

      // Show success message with appropriate context
      let successMessage = "Your feedback board has been created successfully!";
      if (boardData.onChain && ipfsCid !== "local-only") {
        successMessage =
          "Your feedback board has been created and deployed on-chain with IPFS storage!";
      } else if (boardData.onChain) {
        successMessage =
          "Your feedback board has been created and deployed on-chain!";
      } else if (ipfsCid !== "local-only") {
        successMessage =
          "Your feedback board has been created with IPFS storage!";
      }

      // Store board ID for success notification
      setCreatedBoardId(boardData.board_id);
      setShowSuccessNotification(true);
    } catch (error) {
      console.error("💥 Board creation failed:", error);
      
      // Show user-friendly error message based on specific error types
      const getErrorDetails = (error) => {
        const errorMsg = error.message?.toLowerCase() || '';
        const errorString = JSON.stringify(error).toLowerCase();
        
        // Check for insufficient balance errors
        if (errorMsg.includes('insufficient') || 
            errorMsg.includes('not enough') ||
            errorMsg.includes('balance') ||
            errorString.includes('insufficient') ||
            errorString.includes('0x1') || // Solana insufficient funds error code
            errorMsg.includes('account does not have enough sol')) {
          return {
            title: 'Insufficient Balance',
            message: 'You don\'t have enough SOL to create this board. Please add more SOL to your wallet and try again.',
            actionText: 'Add SOL'
          };
        }
        
        // Check for wallet connection errors
        if (errorMsg.includes('wallet not connected') ||
            errorMsg.includes('user rejected') ||
            errorMsg.includes('user denied') ||
            errorMsg.includes('user cancelled')) {
          return {
            title: 'Wallet Connection Issue',
            message: 'Please connect your wallet and approve the transaction to create your board.',
            actionText: 'Connect Wallet'
          };
        }
        
        // Check for network/RPC errors
        if (errorMsg.includes('network') ||
            errorMsg.includes('rpc') ||
            errorMsg.includes('connection') ||
            errorMsg.includes('timeout')) {
          return {
            title: 'Network Connection Error',
            message: 'Unable to connect to the Solana network. Please check your internet connection and try again.',
            actionText: 'Retry'
          };
        }
        
        // Check for IPFS service configuration errors
        if (error.message.includes('No IPFS service available') ||
            errorMsg.includes('ipfs service not available')) {
          return {
            title: 'Service Configuration Error',
            message: 'IPFS service is not configured properly. Please contact support.',
            actionText: 'Contact Support'
          };
        }
        
        // Check for IPFS upload errors
        if (error.message.includes('IPFS upload failed') ||
            errorMsg.includes('ipfs') ||
            errorMsg.includes('pinata')) {
          return {
            title: 'IPFS Upload Failed',
            message: 'Failed to upload board data to IPFS. Please check your internet connection and try again.',
            actionText: 'Retry Upload'
          };
        }
        
        // Check for transaction failures
        if (errorMsg.includes('transaction failed') ||
            errorMsg.includes('simulation failed') ||
            errorMsg.includes('blockhash not found')) {
          return {
            title: 'Transaction Failed',
            message: 'The blockchain transaction failed. This might be due to network congestion. Please try again.',
            actionText: 'Retry Transaction'
          };
        }
        
        // Default blockchain error
        if (error.message.includes('Blockchain board creation failed')) {
          return {
            title: 'Blockchain Error',
            message: 'The blockchain transaction encountered an error. Please try again or contact support if the issue persists.',
            actionText: 'Try Again'
          };
        }
        
        // Generic error
        return {
          title: 'Board Creation Failed',
          message: error.message || 'An unexpected error occurred. Please try again.',
          actionText: 'Try Again'
        };
      };
      
      const errorDetails = getErrorDetails(error);
      
      setErrorNotification({
        isOpen: true,
        title: errorDetails.title,
        message: errorDetails.message,
        actionText: errorDetails.actionText,
        onAction: null
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <main className="pt-16">
          {/* Enhanced Hero Section */}
          <section className="section-padding py-20 text-center">
            <div className="max-w-6xl mx-auto">
              <div className="inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-full mb-6">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm font-mono text-muted-foreground">
                  Setup takes less than 30 seconds
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Create Your Feedback Board
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Collect valuable feedback from your audience with our simple,
                no-hassle platform. Get honest insights that help you improve
                and grow.
              </p>

              <Button
                variant="default"
                size="lg"
                iconName="ArrowDown"
                iconPosition="right"
                onClick={() => {
                  const target = document.getElementById("board-form");
                  if (target) {
                    target.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow px-8 py-4 text-lg font-semibold mb-12"
              >
                Get Started
              </Button>

              {/* Key Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                  {
                    icon: "Clock",
                    title: "Quick Setup",
                    description:
                      "Get your feedback board live in under 30 seconds",
                  },
                  {
                    icon: "Shield",
                    title: "Anonymous by Default",
                    description:
                      "Contributors can share honest feedback without fear",
                  },
                  {
                    icon: "BarChart",
                    title: "Organized Results",
                    description:
                      "Feedback is automatically categorized and easy to review",
                  },
                ].map((benefit, index) => (
                  <div key={index} className="glass-card p-6 rounded-2xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon
                        name={benefit.icon}
                        size={24}
                        className="text-accent"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Creation Form */}
          <section
            id="board-form"
            className="section-padding py-20 bg-gradient-to-br from-muted/5 to-background"
          >
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Let's Build Your Board
                </h2>
                <p className="text-xl text-muted-foreground">
                  Follow these simple steps to create your feedback collection
                  board
                </p>
              </div>

              {/* Single Form Card */}
              <div className="w-full">
                <div className="glass-card p-8 md:p-12 rounded-3xl shadow-2xl overflow-visible">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column - Category and Info */}
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">
                          Choose Your Category
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          What type of feedback are you looking to collect?
                        </p>

                        {/* Custom Category Dropdown */}
                        <div className="relative z-20">
                          <button
                            onClick={() =>
                              setShowCategoryDropdown(!showCategoryDropdown)
                            }
                            className="w-full p-4 bg-input border-2 border-border rounded-2xl text-left flex items-center justify-between hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                          >
                            <div className="flex items-center space-x-3">
                              {formData.category ? (
                                <>
                                  <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                                    <Icon
                                      name={
                                        categories.find(
                                          (c) => c.value === formData.category
                                        )?.icon || "Tag"
                                      }
                                      size={20}
                                      className="text-accent"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-lg font-medium text-foreground">
                                      {
                                        categories.find(
                                          (c) => c.value === formData.category
                                        )?.label
                                      }
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                      {
                                        categories.find(
                                          (c) => c.value === formData.category
                                        )?.description
                                      }
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-10 h-10 bg-muted/50 rounded-xl flex items-center justify-center">
                                    <Icon
                                      name="ChevronDown"
                                      size={20}
                                      className="text-muted-foreground"
                                    />
                                  </div>
                                  <span className="text-base text-muted-foreground">
                                    Select a category...
                                  </span>
                                </>
                              )}
                            </div>
                            <Icon
                              name="ChevronDown"
                              size={20}
                              className={`text-muted-foreground transition-transform duration-200 ${
                                showCategoryDropdown ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {/* Dropdown Menu */}
                          {showCategoryDropdown && (
                            <div
                              className="absolute top-full left-0 right-0 mt-2 bg-background rounded-2xl border-2 border-border shadow-2xl z-50"
                              style={{
                                height: "26rem",
                                overflowY: "auto",
                                scrollbarWidth: "thin",
                                scrollbarColor: "#00FF88 transparent",
                              }}
                              onWheel={(e) => e.stopPropagation()}
                            >
                              <style
                                dangerouslySetInnerHTML={{
                                  __html: `
                                .category-dropdown::-webkit-scrollbar {
                                  width: 8px;
                                }
                                .category-dropdown::-webkit-scrollbar-track {
                                  background: transparent;
                                }
                                .category-dropdown::-webkit-scrollbar-thumb {
                                  background: #00FF88;
                                  border-radius: 4px;
                                }
                                .category-dropdown::-webkit-scrollbar-thumb:hover {
                                  background: #00CC6F;
                                }
                              `,
                                }}
                              />
                              <div className="category-dropdown h-full overflow-y-auto">
                                {categories.map((category) => (
                                  <button
                                    key={category.value}
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        category: category.value,
                                      });
                                      setShowCategoryDropdown(false);
                                    }}
                                    className="w-full p-4 text-left hover:bg-accent/10 hover:scale-[1.02] transition-all duration-200 border-b border-border/50 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl group"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center group-hover:bg-accent/30 transition-colors duration-200">
                                        <Icon
                                          name={category.icon}
                                          size={20}
                                          className="text-accent group-hover:scale-110 transition-transform duration-200"
                                        />
                                      </div>
                                      <div>
                                        <span className="text-lg font-medium text-foreground block">
                                          {category.label}
                                        </span>
                                        <p className="text-sm text-muted-foreground">
                                          {category.description}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info Sections */}
                      <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                        <div className="flex items-center space-x-2 mb-2">
                          <Icon
                            name="Lightbulb"
                            size={16}
                            className="text-accent"
                          />
                          <span className="text-sm font-semibold text-accent">
                            Why choose a category?
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Categories help set clear expectations for
                          contributors and organize your feedback more
                          effectively.
                        </p>
                      </div>

                      <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                        <div className="flex items-center space-x-2 mb-2">
                          <Icon
                            name="Target"
                            size={16}
                            className="text-accent"
                          />
                          <span className="text-sm font-semibold text-accent">
                            Pro tip
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Clear, specific titles get 3x more quality responses.
                          Include the context and purpose.
                        </p>
                      </div>

                      <div className="bg-accent/10 rounded-xl px-3 py-2 border border-accent/20">
                        <p className="text-xs text-muted-foreground">
                          💡 Specific descriptions reduce irrelevant feedback by
                          60%
                        </p>
                      </div>

                      {/* Create Button */}
                      <Button
                        variant="default"
                        size="lg"
                        iconName={connected ? (balanceInfo.hasEnoughBalance ? "Rocket" : "AlertTriangle") : "Wallet"}
                        iconPosition="left"
                        loading={isDeploying || connecting || balanceInfo.isChecking}
                        onClick={handleCreate}
                        className={`w-full shadow-glow px-8 py-4 text-lg font-bold ${
                          connected && !balanceInfo.hasEnoughBalance 
                            ? 'bg-error text-white hover:bg-error/90' 
                            : 'bg-accent text-accent-foreground hover:bg-accent/90'
                        }`}
                        disabled={
                          (connected && !balanceInfo.hasEnoughBalance) ||
                          (connected &&
                            (!formData?.title?.trim() ||
                              !formData?.description?.trim() ||
                              !formData?.category?.trim()))
                        }
                      >
                        {isDeploying
                          ? "Creating Your Board..."
                          : connecting
                          ? "Connecting Wallet..."
                          : balanceInfo.isChecking
                          ? "Checking Balance..."
                          : connected && !balanceInfo.hasEnoughBalance
                          ? `Insufficient Balance (${formatSolBalance(balanceInfo.balance)})`
                          : connected
                          ? "Create Feedback Board"
                          : "Connect Wallet"}
                      </Button>
                    </div>

                    {/* Right Column - Title and Description */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">
                          Board Details
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Give your feedback board a clear title and description
                        </p>
                      </div>

                      {/* Title Input */}
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground">
                          Board Title *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Product Feature Feedback, Website Redesign Input..."
                          className="w-full px-6 py-4 bg-input border-2 border-border rounded-2xl text-foreground placeholder:text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 text-lg font-medium"
                          value={formData?.title}
                          onChange={(e) =>
                            handleInputChange("title", e?.target?.value)
                          }
                        />
                        {errors?.title && (
                          <p className="text-sm text-error font-medium">
                            {errors?.title}
                          </p>
                        )}
                      </div>

                      {/* Description Input */}
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground">
                          Description *
                        </label>
                        <textarea
                          className="w-full px-6 py-4 bg-input border-2 border-border rounded-2xl text-foreground placeholder:text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-none transition-all duration-200 text-lg"
                          rows={8}
                          placeholder="Describe what kind of feedback you're looking for. Be specific about topics, tone, and expectations to get better responses..."
                          value={formData?.description}
                          onChange={(e) =>
                            handleInputChange("description", e?.target?.value)
                          }
                        />
                        {errors?.description && (
                          <p className="text-sm text-error font-medium">
                            {errors?.description}
                          </p>
                        )}
                        <div className="flex justify-end">
                          <p className="text-sm text-muted-foreground font-medium">
                            {formData?.description?.length}/500
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Info Section */}
          <section className="section-padding py-16">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mt-16">
                <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-3xl p-8 border border-success/20">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Icon
                      name="CheckCircle"
                      size={20}
                      className="text-success"
                    />
                    <span className="text-lg font-bold text-success">
                      What happens after you create your board?
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Icon name="Zap" size={20} className="text-success" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Instant Setup
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Board goes live immediately
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Icon name="Share" size={20} className="text-success" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Shareable Link
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Get a link to share with your audience
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Icon
                          name="MessageSquare"
                          size={20}
                          className="text-success"
                        />
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Start Collecting
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Begin receiving feedback immediately
                      </p>
                    </div>
                  </div>

                  {/* <div className="bg-accent/10 rounded-xl p-4 border border-accent/20 mt-6"> */}
                  {/* <div className="flex items-center justify-center space-x-2 mb-2">
                    <Icon name="Lightbulb" size={16} className="text-accent" />
                    <span className="text-sm font-semibold text-accent">Pro Tips</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Clear titles get 3x more quality responses</span>
                    </div>
                    <div className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Specific descriptions reduce irrelevant feedback by 60%</span>
                    </div>
                    <div className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Anonymous feedback encourages honest input</span>
                    </div>
                    <div className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Share your link on social media for wider reach</span>
                    </div>
                  </div>
                </div> */}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {/* Success Notification */}
      <SuccessNotification
        isOpen={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title="Board Created Successfully! 🚀"
        message="Your feedback board has been created and stored on IPFS! It's now ready to receive feedback from contributors."
        actionText="View My Board"
        onAction={() => navigate(`/board/${createdBoardId}`)}
        duration={7000}
      />

      {/* Error Notification */}
      <ErrorNotification
        isOpen={errorNotification.isOpen}
        onClose={() => setErrorNotification({ ...errorNotification, isOpen: false })}
        title={errorNotification.title}
        message={errorNotification.message}
        actionText={errorNotification.actionText}
        onAction={errorNotification.onAction}
      />
      
      <Footer />
    </>
  );
};

export default BoardCreationStudio;
