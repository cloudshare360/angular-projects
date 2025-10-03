#!/bin/bash

# Requirement Change Detection and Auto-Sync
# Generated: October 2, 2025
# Purpose: Monitor requirements.md for changes and auto-trigger synchronization

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REQUIREMENTS_FILE="$PROJECT_ROOT/requirements.md"
SYNC_SCRIPT="$SCRIPT_DIR/sync-requirements.sh"
CHECKSUM_FILE="$SCRIPT_DIR/reports/requirements-checksum.txt"
LOG_FILE="$SCRIPT_DIR/reports/requirement-monitoring.log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to calculate file checksum
calculate_checksum() {
    local file="$1"
    if [ -f "$file" ]; then
        sha256sum "$file" | cut -d' ' -f1
    else
        echo "FILE_NOT_FOUND"
    fi
}

# Function to detect requirement changes
detect_requirement_changes() {
    local current_checksum=""
    local stored_checksum=""
    
    # Calculate current checksum
    current_checksum=$(calculate_checksum "$REQUIREMENTS_FILE")
    
    # Get stored checksum
    if [ -f "$CHECKSUM_FILE" ]; then
        stored_checksum=$(cat "$CHECKSUM_FILE")
    else
        stored_checksum="INITIAL_RUN"
    fi
    
    log "Current checksum: $current_checksum"
    log "Stored checksum: $stored_checksum"
    
    if [ "$current_checksum" != "$stored_checksum" ]; then
        return 0  # Changes detected
    else
        return 1  # No changes
    fi
}

# Function to analyze what changed
analyze_requirement_changes() {
    local requirements_file="$1"
    local backup_file="$requirements_file.last_sync"
    
    if [ -f "$backup_file" ]; then
        echo -e "${CYAN}📊 Analyzing requirement changes...${NC}"
        
        # Count total requirements before and after
        old_total=$(grep -c "^[[:space:]]*- \[" "$backup_file" 2>/dev/null || echo "0")
        new_total=$(grep -c "^[[:space:]]*- \[" "$requirements_file" 2>/dev/null || echo "0")
        
        old_completed=$(grep -c "^[[:space:]]*- \[x\]" "$backup_file" 2>/dev/null || echo "0")
        new_completed=$(grep -c "^[[:space:]]*- \[x\]" "$requirements_file" 2>/dev/null || echo "0")
        
        echo -e "${BLUE}Change Analysis:${NC}"
        echo -e "  Total Requirements: $old_total → $new_total (${GREEN}+$((new_total - old_total))${NC})"
        echo -e "  Completed: $old_completed → $new_completed (${GREEN}+$((new_completed - old_completed))${NC})"
        
        # Show new requirements if any
        if [ $new_total -gt $old_total ]; then
            echo -e "\n${YELLOW}New Requirements Detected:${NC}"
            # Use diff to find new lines
            diff "$backup_file" "$requirements_file" | grep "^>" | grep "- \[" | head -5 | while read -r line; do
                requirement=$(echo "$line" | sed 's/^> *//')
                echo -e "  ${GREEN}+${NC} $requirement"
            done
        fi
        
        # Show status changes
        if [ $new_completed -gt $old_completed ]; then
            echo -e "\n${GREEN}Requirements Completed:${NC}"
            echo -e "  ${GREEN}+$((new_completed - old_completed))${NC} requirements marked as complete"
        fi
    else
        echo -e "${YELLOW}First run - no previous version to compare${NC}"
    fi
}

# Function to update checksum
update_checksum() {
    local checksum="$1"
    echo "$checksum" > "$CHECKSUM_FILE"
    log "Updated checksum file with: $checksum"
}

# Function to create backup for comparison
create_backup_for_comparison() {
    local source_file="$1"
    local backup_file="$source_file.last_sync"
    
    if [ -f "$source_file" ]; then
        cp "$source_file" "$backup_file"
        log "Created backup: $backup_file"
    fi
}

# Parse command line arguments
WATCH_MODE=false
FORCE_SYNC=false
CONTINUOUS_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --watch|-w)
            WATCH_MODE=true
            shift
            ;;
        --force|-f)
            FORCE_SYNC=true
            shift
            ;;
        --continuous|-c)
            CONTINUOUS_MODE=true
            shift
            ;;
        --help|-h)
            echo -e "${CYAN}Requirement Change Detection Usage:${NC}"
            echo ""
            echo -e "${BLUE}Basic Usage:${NC}"
            echo "  ./monitor-requirements.sh              # Check once for changes"
            echo ""
            echo -e "${BLUE}Monitoring Modes:${NC}"
            echo "  ./monitor-requirements.sh --watch      # Watch for changes (one-time check)"
            echo "  ./monitor-requirements.sh --continuous # Continuous monitoring (daemon mode)"
            echo ""
            echo -e "${BLUE}Options:${NC}"
            echo "  -w, --watch        Check for changes and trigger sync if needed"
            echo "  -c, --continuous   Run continuously, checking every 30 seconds"
            echo "  -f, --force        Force synchronization even if no changes detected"
            echo "  -h, --help         Show this help message"
            echo ""
            echo -e "${BLUE}Examples:${NC}"
            echo "  ./monitor-requirements.sh --watch --force"
            echo "  ./monitor-requirements.sh --continuous"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}🔍 Requirement Change Detection${NC}"
echo -e "${CYAN}================================${NC}"
log "Starting requirement change detection..."

# Create reports directory if not exists
mkdir -p "$(dirname "$CHECKSUM_FILE")"
mkdir -p "$(dirname "$LOG_FILE")"

# Main monitoring logic
monitor_requirements() {
    local changes_detected=false
    
    if [ "$FORCE_SYNC" = true ]; then
        echo -e "${YELLOW}🔄 Force sync mode - synchronization will run regardless of changes${NC}"
        changes_detected=true
    elif detect_requirement_changes; then
        echo -e "${GREEN}✅ Changes detected in requirements.md${NC}"
        changes_detected=true
        
        # Analyze what changed
        analyze_requirement_changes "$REQUIREMENTS_FILE"
    else
        echo -e "${BLUE}ℹ️  No changes detected in requirements.md${NC}"
        changes_detected=false
    fi
    
    if [ "$changes_detected" = true ]; then
        echo -e "\n${CYAN}🚀 Triggering automatic synchronization...${NC}"
        
        # Execute synchronization script
        if [ -x "$SYNC_SCRIPT" ]; then
            if "$SYNC_SCRIPT"; then
                echo -e "${GREEN}✅ Synchronization completed successfully${NC}"
                
                # Update checksum after successful sync
                new_checksum=$(calculate_checksum "$REQUIREMENTS_FILE")
                update_checksum "$new_checksum"
                
                # Create backup for future comparisons
                create_backup_for_comparison "$REQUIREMENTS_FILE"
                
                # Update master testing script with new completion
                echo -e "\n${CYAN}🔄 Triggering complete testing framework...${NC}"
                master_script="$SCRIPT_DIR/run-complete-testing.sh"
                if [ -x "$master_script" ]; then
                    echo -e "${BLUE}Would you like to run the complete testing framework? (y/N):${NC}"
                    if [ "$CONTINUOUS_MODE" = true ]; then
                        echo -e "${YELLOW}Continuous mode - skipping interactive testing${NC}"
                    else
                        read -p "" -n 1 -r
                        echo
                        if [[ $REPLY =~ ^[Yy]$ ]]; then
                            "$master_script" --automated
                        fi
                    fi
                fi
                
                return 0
            else
                echo -e "${RED}❌ Synchronization failed${NC}"
                return 1
            fi
        else
            echo -e "${RED}❌ Synchronization script not found or not executable${NC}"
            return 1
        fi
    else
        log "No synchronization needed"
        return 0
    fi
}

# Execute based on mode
if [ "$CONTINUOUS_MODE" = true ]; then
    echo -e "${PURPLE}🔄 Starting continuous monitoring mode...${NC}"
    echo -e "${PURPLE}Press Ctrl+C to stop monitoring${NC}"
    
    # Trap cleanup
    trap 'echo -e "\n${YELLOW}🛑 Stopping continuous monitoring...${NC}"; exit 0' INT TERM
    
    while true; do
        echo -e "\n${BLUE}📅 $(date): Checking for requirement changes...${NC}"
        
        if monitor_requirements; then
            echo -e "${GREEN}✅ Monitoring cycle completed${NC}"
        else
            echo -e "${RED}❌ Monitoring cycle failed${NC}"
        fi
        
        echo -e "${BLUE}⏳ Waiting 30 seconds before next check...${NC}"
        sleep 30
    done
elif [ "$WATCH_MODE" = true ]; then
    echo -e "${BLUE}🔍 Single check for requirement changes...${NC}"
    monitor_requirements
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "\n${GREEN}✅ Requirement monitoring completed successfully${NC}"
    else
        echo -e "\n${RED}❌ Requirement monitoring completed with errors${NC}"
    fi
    
    exit $exit_code
else
    # Default behavior - just check for changes
    echo -e "${BLUE}🔍 Checking for requirement changes...${NC}"
    
    if detect_requirement_changes; then
        echo -e "${GREEN}✅ Changes detected in requirements.md${NC}"
        analyze_requirement_changes "$REQUIREMENTS_FILE"
        echo -e "\n${YELLOW}💡 Run with --watch to trigger automatic synchronization${NC}"
        exit 1  # Exit with 1 to indicate changes were found
    else
        echo -e "${BLUE}ℹ️  No changes detected in requirements.md${NC}"
        exit 0
    fi
fi