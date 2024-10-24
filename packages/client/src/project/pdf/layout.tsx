import styled from '@emotion/styled';

// Got to add a borderBottom of 1 px to avoid a strange white border on print
export const BaseLayout = styled.div`
  width: 200mm;
  height: 287mm;
  margin: 0;
  padding: 0;
  box-sizing: content-box;
  padding-left: 10mm;
  background-color: white;
  page-break-before: always;
`;

export const LastPageLayout = styled(BaseLayout)`
  padding-left: 0;
  width: 210mm;
  height: 297mm;
`;
export const CoverLayout = styled(BaseLayout)`
  background-color: var(--lightgreen);
  padding-top: 10mm;
  border-bottom: 1px solid var(--lightgreen);
`;

export const PageLayout = styled(BaseLayout)`
  height: 297.1mm;
  border-left: 1px solid white;
`;
export const CoverContentLayout = styled.div`
  border-radius: 20px;
  background-color: white;
  width: 190mm;
  min-height: 277mm;
  display: flex;
  flex-direction: column;
`;
export const ContentLayout = styled.div`
  box-sizing: border-box;
  border-right: 1cm solid var(--brightergreen);
  width: 200mm;
  background-color: white;
  min-height: 262mm;
  display: flex;
  flex-direction: column;
  align-items: baseline;
`;

export const Logo = styled.img`
  max-width: 80px;
  max-height: 40px;
  cursor: pointer;
`;

export type TextProps = {
  fontSize: string;
  color?: string;
  condensed?: boolean;
  backgroundColor?: string;
  fontWeight?: string;
  textAlign?: string;
};

export const Text = styled.div`
  font-family: Montserrat, sans-serif;
  font-size: ${({ fontSize }: TextProps) => fontSize};
  font-weight: ${({ fontWeight }: TextProps) => fontWeight || 'normal'};
  color: ${({ color }: TextProps) => color || 'black'};
  line-height: ${({ condensed }: TextProps) => (condensed ? '0.85' : '1')};
  text-align: ${({ textAlign }: TextProps) => textAlign || 'center'};
  text-wrap: wrap;
`;
